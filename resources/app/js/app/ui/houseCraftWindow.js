class HouseCraftWindow extends UIElement
{
    constructor()
    {
        super("craft");
        this.window = null;
        this.info = null;
        this.pageIndex = 0;
        this.prevButton = null;
        this.nextButton = null;
        this.pageWindow = null;
        this.animator = new Animator();
        this.windowAnim = null;
    }

    get itemCountByPage()
    {
        return 5;
    }

    get pageCount()
    {
        var craftable = globalSystem.itemCraftData.getDatasByWhere((data) =>
        {
            if (data.type == "dismantle")
            {
                return false;
            }
            return true;
        });
        var itemCount = craftable.length;
        var result = parseInt((itemCount - 1) / this.itemCountByPage) + 1;
        return result;
    }

    setup()
    {
        this.window = document.getElementById("houseCraft");
        this.info = document.getElementById("houseCraftInfo");
        this.prevButton = document.getElementById("houseCraftInfoPrev");
        this.nextButton = document.getElementById("houseCraftInfoNext");
        this.pageWindow = document.getElementById("houseCraftInfoPage");

        this.prevButton.onclick = () => { this.prevPage(); };
        this.nextButton.onclick = () => { this.nextPage(); };

        this.disable();
    }

    update()
    {
        this.animator.update();
    }

    enable()
    {
        this.updateItems();
        this.window.style.display = "inline";
    }

    disable()
    {
        this.window.style.display = "none";
    }

    updateItems()
    {
        this.info.innerHTML = "";
        var recipes = globalSystem.itemCraftData.datas[0];
        var startIndex = this.pageIndex * this.itemCountByPage;
        for (var i = startIndex; i < startIndex + this.itemCountByPage; i++)
        {
            var recipe = recipes[i];
            if (recipe == null)
            {
                continue;
            }
            if (recipe.type == "dismantle")
            {
                continue;
            }

            var description = this.getCraftDescription(recipe);
            var button = document.createElement("button");
            button.className = "app borderless";
            button.style.position = "relative";
            button.style.lineHeight = "200%";
            button.recipeData = recipe;

            var isOpen = ItemCraft.isOpen(recipe.id);
            if (isOpen)
            {
                globalSystem.houseManager.openCraft(recipe.id);
                var count = Number(recipe.count);
                var name = "";
                if (count > 1)
                {
                    name = `${recipe.name} x${count}`;
                }
                else
                {
                    name = recipe.name;
                }
                button.innerText = name;
                var canCraft = ItemCraft.canCraft(recipe.id);
                if (canCraft)
                {
                    //button.style.color = Color.black;
                }
                else
                {
                    button.style.color = Color.gray;
                }
            }
            else
            {
                button.innerText = Terminology.get("house_unknown");
                if (StringExtension.isValid(recipe.recipe))
                {
                    description = Terminology.get("house_noRecipeDescription");
                }
                else
                {
                    description = Terminology.get("house_unknownDescription");
                }
                button.style.color = Color.gray;
            }

            button.onclick = function (button, owner, text)
            {
                return function ()
                {
                    var recipe = button.recipeData;
                    owner.showItemMenu(recipe, button, text);
                };
            }(button, this, description);

            this.info.appendChild(button);
            var br = document.createElement('br');
            this.info.appendChild(br);
        }

        this.pageWindow.innerHTML = `${this.pageIndex + 1} / ${this.pageCount}`;
    }

    showItemMenu(recipe, button, description)
    {
        globalSystem.uiManager.context.add(Terminology.get("house_description"), () =>
        {
            globalSystem.uiManager.dialog.open(description);
        });

        var canCraft = ItemCraft.canCraft(recipe.id);
        if (canCraft)
        {
            globalSystem.uiManager.context.add(Terminology.get("house_craft"), () =>
            {
                globalSystem.uiManager.craft.craft(recipe);
            });
        }

        var rect = Element.getRect(button);
        var x = globalSystem.uiManager.window.getWidthPercentage(rect.x + rect.width);
        var y = globalSystem.uiManager.window.getHeightPercentage(rect.y);
        globalSystem.uiManager.context.open(x + 2, y);
    }

    craft(recipe, materials = [])
    {
        var selectMaterial = Type.toBoolean(recipe.selectMaterial);
        if (selectMaterial)
        {
            this.openSelectMaterialDialog(recipe, materials, (recipe, materials) =>
            {
                this.craftItem(recipe, materials);
            });
        }
        else
        {
            var craftableCount = ItemCraft.getCanCtaftCount(recipe.id, null);
            if (craftableCount > 1 && materials.length == 0)
            {
                var list = [];
                var descriptions = [];
                for (var i = 1; i <= craftableCount; i++)
                {
                    list.push(`${i} ${Terminology.get("piece")}`);
                    descriptions.push(StringExtension.empty);
                }
                globalSystem.uiManager.dialog.addButton(0, Terminology.get("house_craft"), () =>
                {
                    var index = globalSystem.uiManager.dialog.selectIndex;
                    var count = parseInt(list[index]);
                    globalSystem.uiManager.dialog.close();
                    for (var i = 0; i < count; i++)
                    {
                        this.craftItem(recipe);
                    }
                });
                globalSystem.uiManager.dialog.addButton(1, Terminology.get("dialog_stop"), () =>
                {
                    globalSystem.uiManager.dialog.close();
                });
                var text = Terminology.get("house_confirmCraftCount").replace("{0}", recipe.name);
                globalSystem.uiManager.dialog.openSelector(text, list, descriptions);
            }
            else
            {
                this.craftItem(recipe, materials);
            }
        }
    }

    craftItem(recipe, materials = [])
    {
        ItemCraft.craft(recipe.id, materials);
        globalSystem.soundManager.playSe(recipe.sound);

        SaveSystem.save();

        this.updateItems();
        globalSystem.uiManager.house.updateItems();
        for (var box of globalSystem.uiManager.itemBoxs)
        {
            box.updateItems();
        }
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

    getCraftDescription(recipe)
    {
        var result = `${ItemCraft.getDescription(recipe)} <br> ${Terminology.get("house_recipe")} : ${ItemCraft.getMaterialDescription(recipe.id)} <br> ${this.getHasMaterialDescription(recipe)}`;
        return result;
    }

    getHasMaterialDescription(recipe)
    {
        var materials = [];
        for (var i = 0; i < 5; i++)
        {
            var field = `material${i}`;
            var material = recipe[field];
            if (StringExtension.isNullOrEmpty(material))
            {
                continue;
            }
            if (materials.indexOf(material) == -1)
            {
                materials.push(material);
            }
        }

        var items = globalSystem.survivorManager.getItems();
        items = items.concat(globalSystem.houseManager.items);
        var list = ItemExecutor.getItemNames(items, (item) =>
        {
            for (var material of materials)
            {
                if (item.id == material)
                {
                    return true;
                }
            }
            return false;
        }, false);

        var count = "";
        for (var i = 0; i < materials.length; i++)
        {
            var found = false;
            for (var info of list)
            {
                if (materials[i] == info.item.id)
                {
                    count += `${info.name} x${info.count}`;
                    found = true;
                    break;
                }
            }

            if (found == false)
            {
                var item = globalSystem.itemData.getDataById(materials[i]);
                count += `${item.name} x${0}`;
            }

            if (i < materials.length - 1)
            {
                count += " / ";
            }
        }

        var result = Terminology.get("house_materialCount");
        result = result.replace("{0}", count);
        return result;
    }

    getCraftTargets(item)
    {
        var targets = globalSystem.itemCraftData.getDatasByMaterial(item);
        var craftTarget = [];
        for (var target of targets)
        {
            var itemData = globalSystem.itemData.getDataById(target.item);
            if (ItemCraft.canCraft(target.id) == false)
            {
                continue;
            }
            craftTarget.push(target);
        }

        return craftTarget;
    }

    canOpenCraftMenu(item)
    {
        var targets = this.getCraftTargets(item);
        var result = targets.length > 0;
        return result;
    }

    openCraftMenu(x, y, item)
    {
        var craftTarget = this.getCraftTargets(item);
        if (craftTarget.length == 0)
        {
            globalSystem.uiManager.context.add(Terminology.get("house_none"), null);
        }
        else
        {
            for (var target of craftTarget)
            {
                const recipe = target;
                globalSystem.uiManager.context.add(recipe.name, () =>
                {
                    globalSystem.uiManager.craft.openCraftDialog(recipe, [item]);
                });
            }
        }

        globalSystem.uiManager.context.open(x, y, 30);
    }

    openCraftDialog(recipe, material)
    {
        var description = this.getCraftDescription(recipe);

        globalSystem.uiManager.dialog.addButton(0, Terminology.get("house_craft"), () =>
        {
            globalSystem.uiManager.dialog.close();
            globalSystem.uiManager.craft.craft(recipe, material);
        });
        globalSystem.uiManager.dialog.addCloseButton(1);

        globalSystem.uiManager.dialog.open(description);
    }

    openSelectMaterialDialog(recipe, materials, onSelected)
    {
        var index = materials.length;
        var key = `material${index}`;
        var materialId = recipe[key];
        var targets = [];
        for (var survivor of globalSystem.survivorManager.survivors)
        {
            for (var hasItem of survivor.inventory.list)
            {
                if (hasItem.id == materialId)
                {
                    const pushItem = hasItem;
                    targets.push(pushItem);
                }
            }
        }
        for (var hasItem of globalSystem.houseManager.items)
        {
            if (hasItem.id == materialId)
            {
                const pushItem = hasItem;
                targets.push(pushItem);
            }
        }

        var items = [];
        for (var target of targets)
        {
            var already = false;
            for (var material of materials)
            {
                if (material == target)
                {
                    already = true;
                    break;
                }
            }
            if (already)
            {
                continue;
            }
            items.push(target);
        }

        var names = [];
        var descriptions = [];
        for (var item of items)
        {
            names.push(ItemExecutor.getName(item));
            descriptions.push(ItemExecutor.getDescription(item, false, false));
        }
        globalSystem.uiManager.dialog.addButton(0, Terminology.get("select"), () =>
        {
            var selectionIndex = globalSystem.uiManager.dialog.selectIndex;
            var item = items[selectionIndex];
            materials.push(item);

            var selectComplete = false;
            var index = materials.length;
            if (index > ItemCraft.materialCountMax)
            {
                selectComplete = true;
            }
            else
            {
                var key = `material${index}`;
                var materialId = recipe[key];
                if (StringExtension.isNullOrEmpty(materialId))
                {
                    selectComplete = true;
                }
            }
            if (selectComplete)
            {
                globalSystem.uiManager.dialog.close();
                if (onSelected != null)
                {
                    onSelected(recipe, materials);
                }
            }
            else
            {
                globalSystem.uiManager.dialog.close();
                this.openSelectMaterialDialog(recipe, materials, onSelected);
            }
        });
        globalSystem.uiManager.dialog.addCloseButton(1);

        var materialCount = ItemCraft.getMaterialCount(recipe);
        var message = `${Terminology.get("item_selectTarget")} （${materials.length + 1}/${materialCount}）`;
        globalSystem.uiManager.dialog.openSelector(message, names, descriptions);
    }
}

new HouseCraftWindow();
