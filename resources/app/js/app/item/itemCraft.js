class ItemCraft
{
    static get materialCountMax()
    {
        return 5;
    }

    static getMaterialCount(recipe)
    {
        var result = 0;
        for (var i = 0; i < ItemCraft.materialCountMax; i++)
        {
            var field = `material${i}`;
            var material = recipe[field];
            if (StringExtension.isNullOrEmpty(material))
            {
                continue;
            }
            result++;
        }
        return result;
    }

    static craft(id, materials = [], owner = null)
    {
        var recipe = globalSystem.itemCraftData.getDataById(id);
        if (recipe == null)
        {
            return null;
        }

        // 素材を所持しているかチェック
        var materialInfos = ItemCraft.getMaterialInfo(id, materials, [], owner);
        if (materialInfos == null)
        {
            return null;
        }

        // 素材を削除
        for (var info of materialInfos)
        {
            info.owner.removeItem(info.material);
        }

        var result = { item: null, owner: null };
        var isSuccess = true;
        var crafts = ItemCraft.craftItem(recipe, materialInfos);
        for (var crafted of crafts)
        {
            if (crafted == null)
            {
                isSuccess = false;
                continue;
            }
            // 製作物を追加
            var pushed = false;
            if (StringExtension.isValid(crafted.inventoryLimit))
            {
                pushed = globalSystem.houseManager.pushItem(crafted, false);
            }
            else
            {
                pushed = materialInfos[0].owner.pushItem(crafted);
            }
            isSuccess &= pushed;

            result.item = crafted;
            result.owner = materialInfos[0].owner;
        }

        if (isSuccess == false)
        {
            // 製作物の獲得に失敗したら、生成物を破棄し、素材を元に戻す
            for (var craft of crafts)
            {
                info.owner.removeItem(craft);
            }
            for (var info of materialInfos)
            {
                info.owner.pushItem(info.material);
            }
            return null;
        }

        return result;
    }

    static craftItem(recipe, materialInfos)
    {
        var count = parseInt(recipe.count);
        var result = [];
        for (var i = 0; i < count; i++)
        {
            var crafted = globalSystem.itemData.getDataById(recipe.item);
            if (crafted == null)
            {
                continue;
            }
            switch (recipe.accessory)
            {
                case "none":
                    {
                        crafted.accessory = null;
                    }
                    break;
                default:
                    {
                        crafted.accessory = materialInfos[0].material.accessory;
                    }
                    break;
            }
            switch (recipe.variable)
            {
                case "select_max":
                    {
                        var variable = Number(materialInfos[0].material.variable);
                        for (var material of materialInfos)
                        {
                            var number = Number(material.material.variable);
                            if (number > variable)
                            {
                                variable = number;
                            }
                        }
                        crafted.variable = variable;
                    }
                    break;
                default:
                    {
                        /* nop */
                    }
                    break;
            }
            result.push(crafted);
        }

        return result;
    }

    static getMaterialInfo(id, materials = [], ignoreMaterials = [], owner = null)
    {
        var recipe = globalSystem.itemCraftData.getDataById(id);
        if (recipe == null)
        {
            return null;
        }

        var materialInfos = [];
        for (var i = 0; i < ItemCraft.materialCountMax; i++)
        {
            var field = `material${i}`;
            var material = recipe[field];
            if (StringExtension.isNullOrEmpty(material))
            {
                continue;
            }

            var data = globalSystem.itemData.getDataById(material);
            var hasMaterial = false;
            for (var s of globalSystem.survivorManager.survivors)
            {
                // 生存者のインベントリの中から探す
                const survivor = s;
                if (owner != null && owner != survivor)
                {
                    continue;
                }

                var items = survivor.getItemsById(material);
                for (var j = 0; j < items.length; j++)
                {
                    const item = items[j];

                    // 指定された材料でないなら次へ
                    if (materials.length > 0)
                    {
                        var validTargetMaterial = false;
                        var isTargetMaterial = false;
                        for (var mat of materials)
                        {
                            if (mat.id != item.id)
                            {
                                continue;
                            }
                            validTargetMaterial = true;
                            if (mat == item)
                            {
                                isTargetMaterial = true;
                                materials = List.remove(materials, mat);
                            }
                        }
                        if (validTargetMaterial && isTargetMaterial == false)
                        {
                            continue;
                        }
                    }

                    var isIgnore = false;
                    for (var ignore of ignoreMaterials)
                    {
                        if (ignore == item)
                        {
                            isIgnore = true;
                            break;
                        }
                    }
                    if (isIgnore)
                    {
                        continue;
                    }

                    var already = false;
                    for (var info of materialInfos)
                    {
                        if (info.owner == survivor && info.material == item && info.index == j)
                        {
                            already = true;
                            break;
                        }
                    }
                    if (already == false)
                    {
                        const index = j;
                        hasMaterial = true;
                        materialInfos.push(new CraftMaterial(data, item, survivor, index));
                        break;
                    }
                }

                if (hasMaterial)
                {
                    break;
                }
            }

            // 見つからなければ、倉庫から探す
            if (hasMaterial == false)
            {
                const house = globalSystem.houseManager;
                if (owner == null || owner == house)
                {
                    var items = house.getItemsById(material);
                    for (var j = 0; j < items.length; j++)
                    {
                        const item = items[j];

                        // 指定された材料でないなら次へ
                        if (materials.length > 0)
                        {
                            var validTargetMaterial = false;
                            var isTargetMaterial = false;
                            for (var mat of materials)
                            {
                                if (mat.id != item.id)
                                {
                                    continue;
                                }
                                validTargetMaterial = true;
                                if (mat == item)
                                {
                                    isTargetMaterial = true;
                                    materials = List.remove(materials, mat);
                                }
                            }
                            if (validTargetMaterial && isTargetMaterial == false)
                            {
                                continue;
                            }
                        }

                        var isIgnore = false;
                        for (var ignore of ignoreMaterials)
                        {
                            if (ignore == item)
                            {
                                isIgnore = true;
                                break;
                            }
                        }
                        if (isIgnore)
                        {
                            continue;
                        }

                        var already = false;
                        for (var info of materialInfos)
                        {
                            if (info.owner == house && info.material == item && info.index == j)
                            {
                                already = true;
                                break;
                            }
                        }
                        if (already == false)
                        {
                            const index = j;
                            hasMaterial = true;
                            materialInfos.push(new CraftMaterial(data, item, house, index));
                            break;
                        }
                    }
                }
            }

            if (hasMaterial == false)
            {
                materialInfos.push(new CraftMaterial(data, null, null, -1));
            }
        }

        return materialInfos;
    }

    static canCraft(id, owner = null)
    {
        var data = globalSystem.itemCraftData.getDataById(id);
        if (data == null)
        {
            return false;
        }
        if (data.type == "dismantle")
        {
            return false;
        }

        var materialInfos = ItemCraft.getMaterialInfo(id, [], [], owner);
        if (materialInfos == null)
        {
            return false;
        }

        for (var info of materialInfos)
        {
            if (info.owner == null)
            {
                return false;
            }
        }

        return true;
    }

    static getCanCtaftCount(id, owner)
    {
        if (ItemCraft.canCraft(id, owner) == false)
        {
            return 0;
        }

        var ignore = [];
        var count = 0;
        for (var count = 0; count < 100; count++)
        {
            var materialInfos = ItemCraft.getMaterialInfo(id, [], ignore, owner);
            if (materialInfos == null)
            {
                return count;
            }

            for (var info of materialInfos)
            {
                if (info.owner == null)
                {
                    return count;
                }
                ignore.push(info.material);
            }
        }

        return count;
    }

    static isOpen(id)
    {
        if (globalSystem.houseManager.isOpenedCraft(id))
        {
            return true;
        }

        var data = globalSystem.itemCraftData.getDataById(id);
        if (StringExtension.isValid(data.recipe))
        {
            var corrects = [];
            var count = 0;
            for (var survivor of globalSystem.survivorManager.survivors)
            {
                var corrects = survivor.getItemsById(data.recipe);
                count += corrects.length;
            }
            corrects = globalSystem.houseManager.getItemsById(data.recipe);
            count += corrects.length;

            var hasResipe = (count > 0);

            return hasResipe;
        }
        else
        {
            var materialInfos = ItemCraft.getMaterialInfo(id);
            if (materialInfos == null)
            {
                return false;
            }

            for (var info of materialInfos)
            {
                if (info.owner != null)
                {
                    return true;
                }
            }
        }

        return false;
    }

    static getCraftTargetNames(item)
    {
        var targets = globalSystem.itemCraftData.getDatasByMaterial(item);
        if (targets == null)
        {
            return null;
        }
        if (targets.length == 0)
        {
            return null;
        }

        var result = "";
        for (var i = 0; i < targets.length; i++)
        {
            var itemData = globalSystem.itemData.getDataById(targets[i].item);
            result += itemData.name;
            if (i < targets.length - 1)
            {
                result += " / ";
            }
        }
        return result;
    }

    static getDescription(recipe)
    {
        var id = recipe[recipe.description];
        if (id == null)
        {
            return null;
        }

        var item = globalSystem.itemData.getDataById(id);
        if (item == null)
        {
            return null;
        }

        var description = ItemExecutor.getDescription(item, true, false);
        var additional = "";
        if (StringExtension.isValid(recipe.additionalDescription))
        {
            additional = recipe.additionalDescription;
        }
        var result = `${recipe.name}<br><br>${description}<br>${additional}<br>`;
        return result;
    }

    static getMaterialDescription(id)
    {
        var result = "";
        var materialInfo = ItemCraft.getMaterialInfo(id);
        for (var i = 0; i < materialInfo.length; i++)
        {
            result += `[${materialInfo[i].data.name}]`;
            if (i < materialInfo.length - 1)
            {
                result += " + ";
            }
        }
        return result;
    }
}

class CraftMaterial
{
    constructor(data, material, owner, index)
    {
        this.data = data;
        this.material = material;
        this.owner = owner;
        this.index = index;
    }
}
