class ItemBoxWindow extends UIElement
{
    constructor(index)
    {
        super("itemBoxs", index);
        this.index = index;
        this.window = null;
        this.name = null;
        this.count = null;
        this.itemBox = null;
        this.pageIndex = 0;
        this.prevButton = null;
        this.nextButton = null;
        this.pageWindow = null;
    }

    get itemCountByPage()
    {
        return 5;
    }

    get pageCount()
    {
        var survivor = globalSystem.survivorManager.survivors[this.index];
        var itemCount = survivor.inventory.itemCount;
        var result = parseInt((itemCount - 1) / this.itemCountByPage) + 1;
        return result;
    }

    setup()
    {
        this.window = document.getElementById(`itemBox${this.index}`);
        this.name = document.getElementById(`itemBoxName${this.index}`);
        this.count = document.getElementById(`itemBoxCount${this.index}`);
        this.itemBox = document.getElementById(`itemBoxInfo${this.index}`);
        this.prevButton = document.getElementById(`itemBoxInfoPrev${this.index}`);
        this.nextButton = document.getElementById(`itemBoxInfoNext${this.index}`);
        this.pageWindow = document.getElementById(`itemBoxInfoPage${this.index}`);

        this.prevButton.onclick = () => { this.prevPage(); };
        this.nextButton.onclick = () => { this.nextPage(); };

        this.updateItems();
    }

    updateItems()
    {
        if (globalSystem.survivorManager.survivors.length <= this.index)
        {
            this.window.style.display = "none";
            return;
        }

        if (this.pageIndex >= this.pageCount)
        {
            this.prevPage();
            return;
        }

        this.window.style.display = "inline";
        var survivor = globalSystem.survivorManager.survivors[this.index];
        this.name.innerText = survivor.name;
        this.count.innerHTML = `(${survivor.inventory.count}/${survivor.inventory.countMax})`;

        this.itemBox.innerHTML = "";
        var startIndex = this.pageIndex * this.itemCountByPage;
        var items = survivor.inventory.getItems();
        items = ItemBoxWindow.sortItems(items, globalSystem.uiManager.house.currentSortType, (i) => { return i.data; });
        for (var i = startIndex; i < startIndex + this.itemCountByPage; i++)
        {
            const item = items[i];
            if (item == null)
            {
                break;
            }

            var equip = "";
            if (survivor.weapon == item.data || survivor.armor == item.data)
            {
                equip = `<blue>${Terminology.get("item_equip")}</blue>`;
            }
            var count = "";
            if (item.count > 1)
            {
                count = `x${item.count}`;
            }
            const itemName = document.createElement("button");
            itemName.innerHTML = Tag.replace(` ${item.name} ${count} ${equip}`);
            itemName.className = "app borderless";
            itemName.style.position = "relative";
            itemName.style.lineHeight = "200%";
            itemName.onclick = () =>
            {
                this.showItemMenu(item.data, item.count, itemName);
            };
            itemName.oncontextmenu = (event) =>
            {
                this.pushItem(item.data);
                return false;
            };
            if (Number(item.data.weight) == 0)
            {
                itemName.style.color = Color.gray;
            }
            this.itemBox.appendChild(itemName);
            var br = document.createElement('br');
            this.itemBox.appendChild(br);
        }

        this.pageWindow.innerHTML = `${this.pageIndex + 1} / ${this.pageCount}`;
    }

    showItemMenu(item, count, button)
    {
        const rect = Element.getRect(button);
        const x = globalSystem.uiManager.window.getWidthPercentage(rect.x + rect.width);
        const y = globalSystem.uiManager.window.getHeightPercentage(rect.y);

        var survivor = globalSystem.survivorManager.survivors[this.index];
        ItemBoxWindow.addItemContextMenu(x, y, item, survivor, () =>
        {
            this.updateItems();
            globalSystem.uiManager.house.updateItems();
        });

        var stakCount = Number(item.stack);
        var movableCount = count;
        if (movableCount > stakCount)
        {
            movableCount = stakCount;
        }

        globalSystem.uiManager.context.add(Terminology.get("house_popItem"), () =>
        {
            this.pushItem(item);
        });
        if (movableCount > 1)
        {
            var text = Terminology.get("house_popItemMultiple").replace("{0}", survivor.name);
            text = text.replace("{1}", movableCount);
            globalSystem.uiManager.context.add(text, () =>
            {
                this.pushItem(item, movableCount);
            });
        }

        for (var survivor of globalSystem.survivorManager.survivors)
        {
            const index = survivor.index;
            if (index == this.index)
            {
                continue;
            }
            globalSystem.uiManager.context.add(Terminology.get("house_pushItem").replace("{0}", survivor.name), () =>
            {
                this.moveItem(item, 1, index);
            });
            if (movableCount > 1)
            {
                var text = Terminology.get("house_pushItemMultiple").replace("{0}", survivor.name);
                text = text.replace("{1}", movableCount);
                globalSystem.uiManager.context.add(text, () =>
                {
                    this.moveItem(item, movableCount, index);
                });
            }
        }

        globalSystem.uiManager.context.open(x + 2, y);
    }

    pushItem(item, count)
    {
        var pushed = globalSystem.houseManager.pushItem(item, true, true);
        if (pushed == false)
        {
            return;
        }
        var survivor = globalSystem.survivorManager.survivors[this.index];
        survivor.removeItem(item);

        if (count > 1)
        {
            var name = ItemExecutor.getName(item);
            var removed = survivor.inventory.removeItemByName(name, count - 1);
            for (var removedItem of removed)
            {
                var pushed = globalSystem.houseManager.pushItem(removedItem, true, true);
                if (pushed == false)
                {
                    survivor.pushItem(removedItem);
                    break;
                }
            }
        }

        SaveSystem.save();
        this.updateItems();
        globalSystem.uiManager.house.updateItems();
    }

    popItem(item, count)
    {
        var survivor = globalSystem.survivorManager.survivors[this.index];
        var pushed = survivor.pushItem(item);
        if (pushed)
        {
            // 武器/防具の場合、現在装備がなければ装備
            if (survivor.weapon == null && item.type == "weapon")
            {
                ItemExecutor.execute(item, survivor);
            }
            if (survivor.armor == null && item.type == "armor")
            {
                ItemExecutor.execute(item, survivor);
            }

            globalSystem.houseManager.removeItem(item);
        }

        if (count > 1)
        {
            var name = ItemExecutor.getName(item);
            var removed = globalSystem.houseManager.removeItemByName(name, count - 1);
            for (var removedItem of removed)
            {
                var pushed = survivor.pushItem(removedItem);
                if (pushed == false)
                {
                    globalSystem.houseManager.pushItem(removedItem);
                    break;
                }
            }
        }

        SaveSystem.save();
        this.updateItems();
        globalSystem.uiManager.house.updateItems();
    }

    moveItem(item, count, targetIndex)
    {
        var owner = globalSystem.survivorManager.survivors[this.index];
        var target = globalSystem.survivorManager.survivors[targetIndex];
        var pushed = target.pushItem(item);
        if (pushed)
        {
            // 武器/防具の場合、現在装備がなければ装備
            if (target.weapon == null && item.type == "weapon")
            {
                ItemExecutor.execute(item, target);
            }
            if (target.armor == null && item.type == "armor")
            {
                ItemExecutor.execute(item, target);
            }

            owner.removeItem(item);
        }

        if (count > 1)
        {
            var name = ItemExecutor.getName(item);
            var removed = owner.inventory.removeItemByName(name, count - 1);
            for (var removedItem of removed)
            {
                var pushed = target.pushItem(removedItem);
                if (pushed == false)
                {
                    owner.pushItem(removedItem);
                    break;
                }
            }
        }

        SaveSystem.save();
        this.updateItems();
        globalSystem.uiManager.itemBoxs[targetIndex].updateItems();
    }

    prevPage()
    {
        if (this.pageIndex <= 0)
        {
            return;
        }
        this.pageIndex--;
        this.updateItems();
    }

    nextPage()
    {
        if (this.pageIndex >= this.pageCount - 1)
        {
            return;
        }
        this.pageIndex++;
        this.updateItems();
    }

    static addItemContextMenu(x, y, item, owner, updateItems)
    {
        globalSystem.uiManager.context.add(Terminology.get("house_description"), () =>
        {
            var description = ItemExecutor.getDescription(item);
            globalSystem.uiManager.dialog.open(description);
        });

        switch (item.context)
        {
            case "equip":
                {
                    if (owner instanceof Survivor)
                    {
                        if (owner.weapon != item && owner.armor != item)
                        {
                            globalSystem.uiManager.context.add(Terminology.get("house_equip"), () =>
                            {
                                ItemExecutor.execute(item, owner);
                                SaveSystem.save();
                                if (updateItems != null)
                                {
                                    updateItems();
                                }
                            });
                        }
                        else
                        {
                            globalSystem.uiManager.context.add(Terminology.get("house_unequip"), () =>
                            {
                                owner.unequip(item);
                                SaveSystem.save();
                                if (updateItems != null)
                                {
                                    updateItems();
                                }
                            });
                        }
                    }
                }
                break;
            case "open":
                {
                    globalSystem.uiManager.context.add(Terminology.get("house_open"), () =>
                    {
                        ItemExecutor.apply(item, owner);
                        SaveSystem.save();
                        if (updateItems != null)
                        {
                            updateItems();
                        }
                    });
                }
                break;
            case "use":
                {
                    globalSystem.uiManager.context.add(Terminology.get("house_use"), () =>
                    {
                        ItemExecutor.apply(item, owner, false, () =>
                        {
                            SaveSystem.save();
                            if (updateItems != null)
                            {
                                updateItems();
                            }
                        });
                    });
                }
                break;
            case "scenario":
                {
                    globalSystem.uiManager.context.add(Terminology.get("house_scenario"), () =>
                    {
                        ItemExecutor.apply(item, owner, false, () =>
                        {
                            SaveSystem.save();
                            if (updateItems != null)
                            {
                                updateItems();
                            }
                        });
                    });
                }
                break;
            case "mission":
                {
                    var requestId = item.variable;
                    var survivorsItems = globalSystem.survivorManager.getItemsById(requestId);
                    var houseItems = globalSystem.houseManager.getItemsById(requestId);
                    var count = survivorsItems.length + houseItems.length;
                    var valid = (count >= parseInt(item.arg0));
                    if (valid)
                    {
                        globalSystem.uiManager.context.add(Terminology.get("house_mission"), () =>
                        {
                            ItemExecutor.apply(item, owner, false, () =>
                            {
                                SaveSystem.save();
                                if (updateItems != null)
                                {
                                    updateItems();
                                }
                            });
                        });
                    }
                }
                break;
            case "departure":
                {
                    globalSystem.uiManager.context.add(Terminology.get("house_departure"), () =>
                    {
                        ItemExecutor.apply(item, owner, false, () =>
                        {
                            SaveSystem.save();
                            if (updateItems != null)
                            {
                                updateItems();
                            }
                        });
                    });
                }
                break;
            default:
                break;
        }

        if (globalSystem.uiManager.craft.canOpenCraftMenu(item))
        {
            globalSystem.uiManager.context.add(Terminology.get("house_craft"), () =>
            {
                globalSystem.uiManager.craft.openCraftMenu(x, y, item);
                if (updateItems != null)
                {
                    updateItems();
                }
            });
        }
    }

    static sortItems(list, sortType, getItemData)
    {
        var result = list.concat();

        switch (sortType)
        {
            case HouseItemWindow.sortType.get:
                break;
            case HouseItemWindow.sortType.type:
                {
                    var sorted = [];
                    var length = globalSystem.itemData.getLength(0);
                    for (var index = 0; index < length; index++)
                    {
                        var data = globalSystem.itemData.getDataByIndex(0, index);
                        for (var item of list)
                        {
                            var itemData = getItemData(item);
                            if (itemData.id == data.id)
                            {
                                sorted.push(item);
                            }
                        }
                    }
                    result = sorted;
                }
                break;
            case HouseItemWindow.sortType.name:
                {
                    result.sort((a, b) => getItemData(a).ruby.localeCompare(getItemData(b).ruby, 'ja'));
                }
                break;
            default:
                break;
        }

        return result;
    }
}

new ItemBoxWindow(0);
new ItemBoxWindow(1);
