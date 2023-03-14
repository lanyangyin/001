class HouseItemWindow extends UIElement
{
    constructor()
    {
        super("house");
        this.window = null;
        this.count = null;
        this.info = null;
        this.switchButton = null;
        this.selectCategoryButton = null;
        this.selectSortButton = null;
        this.currentCategory = null;
        this.currentSortType = null;
        this.itemList = [];
        this.pageIndex = 0;
        this.prevButton = null;
        this.nextButton = null;
        this.pageWindow = null;
        this.windowAnim = null;
        this.animator = new Animator();
        this.enabled = false;
    }

    static get categoryType()
    {
        var result = {
            all: "all",
        };
        return result;
    }

    static get sortType()
    {
        var result =
        {
            get: "get",
            type: "type",
            name: "name",
        };
        return result;
    }

    get itemCountByPage()
    {
        return 5;
    }

    get pageCount()
    {
        var itemCount = this.itemList.length;
        var result = parseInt((itemCount - 1) / this.itemCountByPage) + 1;
        return result;
    }

    setup()
    {
        this.window = document.getElementById("houseItem");
        this.count = document.getElementById("houseItemCount");
        this.info = document.getElementById("houseItemInfo");
        this.switchButton = document.getElementById("houseSwitchCraft");
        this.selectCategoryButton = document.getElementById("houseSelectCategory");
        this.selectSortButton = document.getElementById("houseSelectSort");
        this.prevButton = document.getElementById("houseItemInfoPrev");
        this.nextButton = document.getElementById("houseItemInfoNext");
        this.pageWindow = document.getElementById("houseItemInfoPage");

        this.switchButton.onclick = function ()
        {
            globalSystem.uiManager.house.switchHouseCraft();
        };
        this.selectCategoryButton.onclick = function ()
        {
            globalSystem.uiManager.house.openCategoryMenu();
        };
        this.selectSortButton.onclick = function ()
        {
            globalSystem.uiManager.house.openSortMenu();
        };
        this.prevButton.onclick = () => { this.prevPage(); };
        this.nextButton.onclick = () => { this.nextPage(); };

        this.initialize();
        this.enable();
    }

    update()
    {
        this.animator.update();
    }

    initialize()
    {
        this.switchHouseCraft(true);
        this.setCategory(HouseItemWindow.categoryType.all, Terminology.get("item_category_default"));
        this.setSortType(HouseItemWindow.sortType.get, Terminology.get("item_sort_default"));
    }

    enable()
    {
        this.enabled = true;
        this.updateItems();
        this.window.style.display = "inline";
        this.selectCategoryButton.style.display = "inline";
        this.selectSortButton.style.display = "inline";

    }

    disable()
    {
        this.enabled = false;
        this.window.style.display = "none";
        this.selectCategoryButton.style.display = "none";
        this.selectSortButton.style.display = "none";
    }

    updateItems()
    {
        if (this.pageIndex >= this.pageCount)
        {
            this.prevPage();
            return;
        }

        this.count.innerHTML = `(${globalSystem.houseManager.itemCount}/${HouseManager.itemCountMax})`;

        this.updateItemList();

        this.info.innerHTML = "";
        var startIndex = this.pageIndex * this.itemCountByPage;
        for (var i = startIndex; i < startIndex + this.itemCountByPage; i++)
        {
            if (i >= this.itemList.length)
            {
                break;
            }

            const data = this.itemList[i];
            const item = data.item;
            if (item == null)
            {
                break;
            }
            const button = document.createElement("button");
            if (data.count == 1)
            {
                button.innerText = ItemExecutor.getName(item);
            }
            else
            {
                button.innerText = `${ItemExecutor.getName(item)} x${data.count}`;
            }
            button.className = "app borderless";
            button.style.position = "relative";
            button.style.lineHeight = "200%";
            button.onclick = () =>
            {
                this.showItemMenu(item, data.count, button);
            };
            this.info.appendChild(button);
            var br = document.createElement('br');
            this.info.appendChild(br);
        }

        this.pageWindow.innerHTML = `${this.pageIndex + 1} / ${this.pageCount}`;
    }

    updateItemList()
    {
        var list = List.reverse(globalSystem.houseManager.items);
        this.itemList = ItemExecutor.getItemNames(list, (item) =>
        {
            if (this.currentCategory != HouseItemWindow.categoryType.all)
            {
                return (item.category == this.currentCategory);
            }
            return true;
        });

        this.itemList = ItemBoxWindow.sortItems(this.itemList, this.currentSortType, (i) => { return i.item; });
    }

    showItemMenu(item, count, button)
    {
        const rect = Element.getRect(button);
        const x = globalSystem.uiManager.window.getWidthPercentage(rect.x + rect.width) + 2;
        const y = globalSystem.uiManager.window.getHeightPercentage(rect.y);

        ItemBoxWindow.addItemContextMenu(x, y, item, globalSystem.houseManager, () =>
        {
            for (var itemBox of globalSystem.uiManager.itemBoxs)
            {
                itemBox.updateItems();
            }
            this.updateItems();
        });

        var stakCount = Number(item.stack);
        var movableCount = count;
        if (movableCount > stakCount)
        {
            movableCount = stakCount;
        }

        var pushable = StringExtension.isNullOrEmpty(item.inventoryLimit) || (StringExtension.isValid(item.inventoryLimit) && Number(item.inventoryLimit) > 0);
        if (pushable)
        {
            for (var survivor of globalSystem.survivorManager.survivors)
            {
                const index = survivor.index;
                globalSystem.uiManager.context.add(Terminology.get("house_pushItem").replace("{0}", survivor.name), () =>
                {
                    globalSystem.uiManager.itemBoxs[index].popItem(item, 1);
                });
                if (movableCount > 1)
                {
                    var text = Terminology.get("house_pushItemMultiple").replace("{0}", survivor.name);
                    text = text.replace("{1}", movableCount);
                    globalSystem.uiManager.context.add(text, () =>
                    {
                        globalSystem.uiManager.itemBoxs[index].popItem(item, movableCount);
                    });
                }
            }
        }

        if (Type.toBoolean(item.trash))
        {
            globalSystem.uiManager.context.add(Terminology.get("house_remove"), () =>
            {
                if (count > 1)
                {
                    var list = [];
                    var descriptions = [];
                    for (var i = 1; i <= count; i++)
                    {
                        list.push(`${i} ${Terminology.get("piece")}`);
                        descriptions.push(StringExtension.empty);
                    }
                    globalSystem.uiManager.dialog.addButton(0, Terminology.get("house_remove"), () =>
                    {
                        var index = globalSystem.uiManager.dialog.selectIndex;
                        var count = parseInt(list[index]);
                        globalSystem.uiManager.dialog.close();
                        var name = ItemExecutor.getName(item);
                        globalSystem.houseManager.removeItemByName(name, count);
                        this.updateItems();
                    });
                    globalSystem.uiManager.dialog.addButton(1, Terminology.get("dialog_stop"), () =>
                    {
                        globalSystem.uiManager.dialog.close();
                    });
                    var text = Terminology.get("house_confirmRemoveCount").replace("{0}", ItemExecutor.getName(item));
                    globalSystem.uiManager.dialog.openSelector(text, list, descriptions);
                }
                else
                {
                    globalSystem.uiManager.dialog.addButton(0, Terminology.get("yes"), () =>
                    {
                        globalSystem.uiManager.dialog.close();
                        globalSystem.houseManager.removeItem(item);
                        this.updateItems();
                    });
                    globalSystem.uiManager.dialog.addButton(1, Terminology.get("no"), () =>
                    {
                        globalSystem.uiManager.dialog.close();
                    });
                    var text = Terminology.get("house_removeWarning").replace("{0}", ItemExecutor.getName(item));
                    globalSystem.uiManager.dialog.open(text);
                }
            });
        }

        globalSystem.uiManager.context.open(x, y);
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

    switchHouseCraft(toHouse = false)
    {
        if (toHouse)
        {
            this.enabled = false;
        }

        if (this.enabled)
        {
            this.switchButton.innerHTML = Terminology.get("item_switch_house");
            globalSystem.uiManager.house.disable();
            globalSystem.uiManager.craft.enable();
        }
        else
        {
            this.switchButton.innerHTML = Terminology.get("item_switch_craft");
            globalSystem.uiManager.house.enable();
            globalSystem.uiManager.craft.disable();
        }
    }

    setCategory(category, categoryName = null)
    {
        if (categoryName != null)
        {
            this.selectCategoryButton.innerHTML = categoryName;
        }
        else
        {
            this.selectCategoryButton.innerHTML = Terminology.get(`item_category_${category}`);
        }

        this.currentCategory = category;
        this.pageIndex = 0;
    }

    openCategoryMenu()
    {
        globalSystem.uiManager.context.add(Terminology.get("item_category_all"), () =>
        {
            globalSystem.uiManager.house.setCategory(HouseItemWindow.categoryType.all);
            globalSystem.uiManager.house.updateItems();
        });

        var categorys = globalSystem.itemData.getCategory();
        for (var category of categorys)
        {
            const categoryId = category;
            globalSystem.uiManager.context.add(Terminology.get(`item_category_${categoryId}`), () =>
            {
                globalSystem.uiManager.house.setCategory(categoryId);
                globalSystem.uiManager.house.updateItems();
            });
        }

        var rect = Element.getRect(this.selectCategoryButton);
        var x = globalSystem.uiManager.window.getWidthPercentage(rect.x);
        var y = globalSystem.uiManager.window.getHeightPercentage(rect.y);
        globalSystem.uiManager.context.open(x, y);
    }

    setSortType(type, sortName = null)
    {
        if (sortName == null)
        {
            this.selectSortButton.innerHTML = Terminology.get(`item_sort_${type}`);
        }
        else
        {
            this.selectSortButton.innerHTML = sortName;
        }

        this.currentSortType = type;
        this.pageIndex = 0;
    }

    openSortMenu()
    {
        var types = Object.keys(HouseItemWindow.sortType);
        for (var type of types)
        {
            const sortType = type;
            var id = `item_sort_${sortType}`;
            globalSystem.uiManager.context.add(Terminology.get(id), () =>
            {
                globalSystem.uiManager.house.setSortType(sortType);
                globalSystem.uiManager.house.updateItems();
                for (var itemBox of globalSystem.uiManager.itemBoxs)
                {
                    itemBox.updateItems();
                }
            });
        }

        var rect = Element.getRect(this.selectSortButton);
        var x = globalSystem.uiManager.window.getWidthPercentage(rect.x);
        var y = globalSystem.uiManager.window.getHeightPercentage(rect.y);
        globalSystem.uiManager.context.open(x, y);
    }
}

new HouseItemWindow();
