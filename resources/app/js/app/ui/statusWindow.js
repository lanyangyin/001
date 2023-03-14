class StatusWindow extends UIElement
{
    constructor(index)
    {
        super("status", index);
        this.index = index;
        this.window = null;
        this.name = null;
        this.vital = null;
        this.item = null;
        this.skill = null;
        this.temporaryItem = null;
    }

    get pageItemCountMax()
    {
        return 10;
    }

    setup()
    {
        this.window = document.getElementById(`status${this.index}`);
        this.name = document.getElementById(`statusName${this.index}`);
        this.vital = document.getElementById(`statusVital${this.index}`);
        this.item = document.getElementById(`statusItem${this.index}`);
        this.skill = document.getElementById(`statusSkill${this.index}`);

        if (this.item != null)
        {
            this.item.onclick = (event) =>
            {
                this.openItem();
                event.stopPropagation();
            };
        }

        if (this.skill != null)
        {
            this.skill.onclick = (event) =>
            {
                this.openSkill();
                event.stopPropagation();
            };
        }
    }

    update()
    {
        var survivor = globalSystem.survivorManager.survivors[this.index];
        if (survivor == null)
        {
            return;
        }

        if (survivor.statusChanged)
        {
            this.updateInfo();
        }
    }

    setupInfo()
    {
        var survivor = globalSystem.survivorManager.survivors[this.index];
        if (survivor == null)
        {
            this.hide();
            return;
        }
        this.name.innerText = survivor.name;
        this.temporaryItem = null;
        this.show();
    }

    updateInfo()
    {
        var survivor = globalSystem.survivorManager.survivors[this.index];
        if (survivor == null)
        {
            return;
        }

        if (this.vital != null)
        {
            var vital = survivor.getVitalButton();
            var stamina = survivor.getStaminaButton();
            this.vital.innerHTML = `${vital} / ${stamina}`;
        }

        if (this.item != null)
        {
            var itemBoxCount = Terminology.get("itemBoxCount");
            var itemCount = survivor.inventory.count;
            if (this.temporaryItem != null)
            {
                itemCount += 1;
            }
            itemBoxCount = itemBoxCount.replace("{0}", itemCount);
            itemBoxCount = itemBoxCount.replace("{1}", survivor.inventory.countMax);
            this.item.innerHTML = itemBoxCount;
        }
    }

    show()
    {
        this.window.style.display = "inline";
    }

    hide()
    {
        this.window.style.display = "none";
    }

    storeTemporaryItem(item)
    {
        this.temporaryItem = item;
        this.updateInfo();
    }

    resetTemporaryItem()
    {
        this.temporaryItem = null;
        this.updateInfo();
    }

    openItem(index = 0)
    {
        if (index > 0)
        {
            var prevIndex = index - this.pageItemCountMax;
            globalSystem.uiManager.context.add(Terminology.get("context_prev"), (event) => { globalSystem.uiManager.context.close(); this.openItem(prevIndex); }, Color.marineBlue);
        }

        var items = this.getItemContexts();
        var count = 0;
        var hasNext = false;
        for (var i = index; i < items.length; i++)
        {
            var item = items[i];
            globalSystem.uiManager.context.add(item.name, item.onClick, item.color);

            count++;
            if (count >= this.pageItemCountMax && items.length - 1 > i)
            {
                hasNext = true;
                break;
            }
        }

        if (hasNext)
        {
            var nextIndex = index + this.pageItemCountMax;
            globalSystem.uiManager.context.add(Terminology.get("context_next"), (event) => { globalSystem.uiManager.context.close(); this.openItem(nextIndex); }, Color.marineBlue);
        }

        var rect = Element.getRect(this.item);
        var x = globalSystem.uiManager.window.getWidthPercentage(rect.x);
        var y = globalSystem.uiManager.window.getHeightPercentage(rect.y);
        globalSystem.uiManager.context.open(x, y + 4, 30);
    }

    getItemContexts()
    {
        var result = [];

        const survivor = globalSystem.survivorManager.survivors[this.index];
        var items = survivor.inventory.getItems();
        for (var item of items)
        {
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

            var color = null;
            if (Number(item.data.weight) == 0)
            {
                color = Color.gray;
            }

            const name = `${item.name} ${count} ${equip}`;
            const fontColor = color;
            const index = this.index;
            const itemData = item.data;
            result.push({
                name: name, onClick: (event) =>
                {
                    var buttonIndex = 0;
                    var text = ItemExecutor.getDescription(itemData);
                    globalSystem.uiManager.dialog.addButton(buttonIndex++, Terminology.get("speak_input"), () =>
                    {
                        var name = ItemExecutor.getName(itemData);
                        globalSystem.uiManager.textInput[index].setInput(name);
                        globalSystem.uiManager.dialog.close();
                    });

                    for (var s of globalSystem.survivorManager.survivors)
                    {
                        if (s == survivor)
                        {
                            continue;
                        }
                        const index = s.index;
                        globalSystem.uiManager.dialog.addButton(buttonIndex++, Terminology.get("house_pushItem").replace("{0}", s.name), () =>
                        {
                            this.moveItem(itemData, index);
                            globalSystem.uiManager.dialog.close();
                        });
                    }

                    globalSystem.uiManager.dialog.addButton(buttonIndex++, Terminology.get("house_remove"), () =>
                    {
                        globalSystem.uiManager.dialog.close();
                        globalSystem.uiManager.dialog.addButton(0, Terminology.get("yes"), () =>
                        {
                            globalSystem.uiManager.dialog.close();
                            this.removeItem(itemData);
                        });
                        globalSystem.uiManager.dialog.addButton(1, Terminology.get("no"), () =>
                        {
                            globalSystem.uiManager.dialog.close();
                        });
                        var text = Terminology.get("house_removeWarning").replace("{0}", ItemExecutor.getName(itemData));
                        globalSystem.uiManager.dialog.open(text);
                    });

                    globalSystem.uiManager.dialog.addCloseButton(buttonIndex++);
                    globalSystem.uiManager.dialog.open(text);

                    globalSystem.uiManager.context.close();
                    event.stopPropagation();
                }, color: fontColor
            });
        }

        if (this.temporaryItem != null)
        {
            const index = this.index;
            const name = ItemExecutor.getName(this.temporaryItem);
            const itemData = this.temporaryItem;
            result.push({
                name: name, onClick: (event) =>
                {
                    globalSystem.uiManager.dialog.addButton(0, Terminology.get("speak_input"), () =>
                    {
                        var name = ItemExecutor.getName(itemData);
                        globalSystem.uiManager.textInput[index].setInput(name);
                        globalSystem.uiManager.dialog.close();
                    });
                    globalSystem.uiManager.dialog.addCloseButton(1);
                    var text = ItemExecutor.getDescription(itemData);
                    text += Terminology.get("item_inHand");
                    globalSystem.uiManager.dialog.open(text);
                    globalSystem.uiManager.context.close();
                    event.stopPropagation();
                }, color: Color.gray
            });
        }

        var tmps = survivor.inventory.getTemporaryByType("memory");
        for (var item of tmps)
        {
            const name = `( ${item.name} )`;
            const itemData = item;
            result.push({
                name: name, onClick: (event) =>
                {
                    var text = ItemExecutor.getDescription(itemData);
                    text += Terminology.get("item_temporary");
                    globalSystem.uiManager.dialog.open(text);
                    globalSystem.uiManager.context.close();
                    event.stopPropagation();
                }, color: Color.gray
            });
        }

        var locationFlags = globalSystem.locationManager.location.getFlagInfo();
        for (var flag of locationFlags)
        {
            const name = flag.data.name;
            const description = flag.data.description;
            var contextName = `( ${name} )`;
            if (flag.count > 1)
            {
                contextName = `( ${name} x${flag.count} )`;
            }
            result.push({
                name: contextName, onClick: (event) =>
                {
                    globalSystem.uiManager.dialog.open(`${name}<br><br>${description}`);
                    globalSystem.uiManager.context.close();
                    event.stopPropagation();
                }, color: Color.gray
            });
        }

        return result;
    }

    moveItem(item, targetIndex)
    {
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

            var survivor = globalSystem.survivorManager.survivors[this.index];
            survivor.removeItem(item);
        }
    }

    removeItem(item)
    {
        var survivor = globalSystem.survivorManager.survivors[this.index];
        survivor.removeItem(item);
    }

    openSkill()
    {
        var survivor = globalSystem.survivorManager.survivors[this.index];
        for (var skill of survivor.skillHolder.skills)
        {
            var name = skill.data.name;
            const index = this.index;
            const data = skill.data;
            globalSystem.uiManager.context.add(name, (event) =>
            {
                globalSystem.uiManager.dialog.open(`${data.name}<br><br>${data.description}`);
                globalSystem.uiManager.context.close();
                event.stopPropagation();
            });
        }

        var rect = Element.getRect(this.skill);
        var x = globalSystem.uiManager.window.getWidthPercentage(rect.x);
        var y = globalSystem.uiManager.window.getHeightPercentage(rect.y);
        globalSystem.uiManager.context.open(x + 2, y + 4, 20);
    }
}

new StatusWindow(0);
new StatusWindow(1);
