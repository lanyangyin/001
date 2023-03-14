class HouseManager extends GlobalManager
{
    constructor()
    {
        super("houseManager");
        this.items = [];
        this.openedCraft = [];
        this.openedItem = [];
    }

    static get itemCountMax()
    {
        return 999;
    }

    get itemCount()
    {
        var result = this.items.length;
        return result;
    }

    pushItem(item, checkCount = true, fullWarning = false)
    {
        if (checkCount && this.items.length >= HouseManager.itemCountMax)
        {
            if (fullWarning)
            {
                var warning = Terminology.get("house_fullWarning");
                globalSystem.uiManager.dialog.open(warning);
            }
            return false;
        }
        this.items.push(item);
        return true;
    }

    removeItem(item)
    {
        var count = this.items.length;
        this.items = List.remove(this.items, item);
        var result = this.items.length < count;
        return result;
    }

    removeItemById(id, count)
    {
        var removed = [];
        for (var i = this.items.length - 1; i >= 0; i--)
        {
            if (removed.length >= count)
            {
                break;
            }
            if (i >= this.items.length)
            {
                continue;
            }
            if (this.items[i].id == id)
            {
                removed.push(this.items[i]);
                this.items = List.remove(this.items, this.items[i]);
            }
        }
        return removed;
    }

    removeItemByName(name, count)
    {
        var removed = [];

        // 表示名で検索して削除
        for (var i = this.items.length - 1; i >= 0; i--)
        {
            if (removed.length >= count)
            {
                break;
            }
            if (i >= this.items.length)
            {
                continue;
            }
            var itemName = ItemExecutor.getName(this.items[i]);
            if (itemName == name)
            {
                removed.push(this.items[i]);
                this.items = List.remove(this.items, this.items[i]);
            }
        }
        // 表示名で検索して削除されなかった場合のみ、名前で検索して削除
        for (var i = this.items.length - 1; i >= 0; i--)
        {
            if (removed.length >= count)
            {
                break;
            }
            if (i >= this.items.length)
            {
                continue;
            }
            if (this.items[i].name == name)
            {
                removed.push(this.items[i]);
                this.items = List.remove(this.items, this.items[i]);
            }
        }

        return removed;
    }

    removeAllItems()
    {
        this.items = [];
    }

    lostItem(item)
    {
        if (item == null)
        {
            return false;
        }
        if (ItemExecutor.isLostable(item) == false)
        {
            return false;
        }
        var result = this.removeItem(item);
        return result;
    }


    getItemById(id)
    {
        for (var item of this.items)
        {
            if (item.id == id)
            {
                return item;
            }
        }
        return null;
    }

    getItemsById(id)
    {
        var result = [];
        for (var item of this.items)
        {
            if (item.id == id)
            {
                result.push(item);
            }
        }
        return result;
    }

    getItemByType(type)
    {
        for (var item of this.items)
        {
            if (item.type == type)
            {
                return item;
            }
        }
        return null;
    }

    getItemsByType(type)
    {
        var result = [];
        for (var item of this.items)
        {
            if (item.type == type)
            {
                result.push(item);
            }
        }
        return result;
    }

    getItemsByKey(key, value)
    {
        var result = [];
        for (var item of this.items)
        {
            if (item[key] == value)
            {
                result.push(item);
            }
        }
        return result;
    }

    hasItemById(id)
    {
        var item = this.getItemById(id);
        var result = (item != null);
        return result;
    }

    openCraft(id)
    {
        if (this.isOpenedCraft(id))
        {
            return;
        }
        this.openedCraft.push(id);
    }

    isOpenedCraft(id)
    {
        if (this.openedCraft.indexOf(id) != -1)
        {
            return true;
        }
        return false;
    }

    clearOpenCraft()
    {
        this.openedCraft = [];
    }

    updateOpenedItem()
    {
        for (var survivor of globalSystem.survivorManager.survivors)
        {
            for (var item of survivor.inventory.list)
            {
                this.openItem(item);
            }
        }
        for (var item of this.items)
        {
            this.openItem(item);
        }
    }

    openItem(item)
    {
        if (item == null)
        {
            return;
        }
        if (this.openedItem.indexOf(item.id) != -1)
        {
            return;
        }
        this.openedItem.push(item.id);
    }

    isOpenedItem(id)
    {
        var result = (this.openedItem.indexOf(id) != -1);
        return result;
    }

    recycle()
    {
        var bonus = globalSystem.bonusData.getRandomByType("recycle");
        if (bonus == null)
        {
            return;
        }

        var result = null;
        var memoryItems = this.getItemsByKey("type", "memory");
        for (var item of memoryItems)
        {
            var date = item.arg0;
            var finished = globalSystem.scenarioManager.isFinishedDate(date);
            if (finished)
            {
                this.removeItem(item);
                var bonusItem = globalSystem.itemData.getDataById(bonus.item);
                if (bonusItem != null)
                {
                    this.pushItem(bonusItem, false);
                    result = bonusItem;
                }
            }
        }
        return result;
    }
}

new HouseManager();
