class survivorInventory
{
    constructor()
    {
        this.list = [];
        this.temporary = [];
        this.additionalCount = 0;
    }

    get count()
    {
        var items = this.getItems();
        var count = 0;
        for (var item of items)
        {
            var weight = Number(item.data.weight);
            if (weight == NaN)
            {
                continue;
            }
            count += weight;
        }
        return count;
    }

    get itemCount()
    {
        var items = this.getItems();
        return items.length;
    }

    get countMax()
    {
        var additional = this.getAdditionalCount();
        return 10 + additional;
    }

    get isFull()
    {
        var result = this.count >= this.countMax;
        return result;
    }

    push(item)
    {
        var result = true;
        this.list.push(item);

        if (StringExtension.isValid(item.inventoryLimit))
        {
            var limit = Number(item.inventoryLimit);
            var has = this.getItemsById(item.id);
            if (has.length > limit)
            {
                result = false;
            }
        }

        if (this.count > this.countMax)
        {
            result = false;
        }

        if (result == false)
        {
            this.list.pop();
        }

        return result;
    }

    remove(item)
    {
        var result = false;
        for (var i = 0; i < this.list.length; i++)
        {
            if (this.list[i] == item)
            {
                this.list[i] = null;
                result = true;
                break;
            }
        }
        this.list = this.list.filter(n => n !== null);

        if (result)
        {
            this.depositCountOver();
        }

        return result;
    }

    lost(item)
    {
        if (item == null)
        {
            return false;
        }
        if (Type.toBoolean(item.lost) == false)
        {
            return false;
        }
        var result = this.remove(item);
        return result;
    }

    removeItemByName(name, count)
    {
        var removed = [];

        // 表示名で検索して削除
        for (var i = this.list.length - 1; i >= 0; i--)
        {
            if (removed.length >= count)
            {
                break;
            }
            var itemName = ItemExecutor.getName(this.list[i]);
            if (itemName == name)
            {
                removed.push(this.list[i]);
                this.list = List.remove(this.list, this.list[i]);
            }
        }
        // 表示名で検索して削除されなかった場合のみ、名前で検索して削除
        for (var i = this.list.length - 1; i >= 0; i--)
        {
            if (removed.length >= count)
            {
                break;
            }
            if (this.list[i].name == name)
            {
                removed.push(this.list[i]);
                this.list = List.remove(this.list, this.list[i]);
            }
        }

        return removed;
    }

    removeAll()
    {
        this.list = [];
    }

    lostAll()
    {
        for (var i = this.list.length - 1; i >= 0; i--)
        {
            this.lost(this.list[i]);
        }
    }

    getItems()
    {
        var result = [];
        for (var item of this.list)
        {
            var name = ItemExecutor.getName(item);
            var stack = Number(item.stack);
            var data = { name: name, count: 1, data: item };
            if (stack == 1)
            {
                result.push(data);
            }
            else
            {
                var isAlready = false;
                for (var already of result)
                {
                    if (already.name == name && already.count < stack)
                    {
                        already.count += 1;
                        already.data = item;
                        isAlready = true;
                        break;
                    }
                }
                if (isAlready == false)
                {
                    result.push(data);
                }
            }
        }
        return result;
    }

    getItemById(id)
    {
        for (var item of this.list)
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
        for (var item of this.list)
        {
            if (item.id == id)
            {
                result.push(item);
            }
        }
        return result;
    }

    getItemByName(name)
    {
        for (var item of this.list)
        {
            if (ItemExecutor.getName(item) == name)
            {
                return item;
            }
        }
        for (var item of this.list)
        {
            if (item.name == name)
            {
                return item;
            }
        }
        return null;
    }

    getItemByType(type)
    {
        var list = this.getItemsByType(type);
        if (list.length == 0)
        {
            return null;
        }

        var result = list[0];
        return result;
    }

    getItemsByType(type)
    {
        var result = [];
        for (var item of this.list)
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
        for (var item of this.list)
        {
            if (item[key] == value)
            {
                result.push(item);
            }
        }
        return result;
    }

    has(item)
    {
        for (var i of this.list)
        {
            if (i == item)
            {
                return true;
            }
        }
        return false;
    }

    getAdditionalCount()
    {
        var result = 0;
        for (var item of this.list)
        {
            if (item.type == "inventory")
            {
                var add = Number(item.arg0);
                if (add > result)
                {
                    result = add;
                }
            }
        }

        result += this.additionalCount;

        return result;
    }

    depositCountOver()
    {
        if (this.count <= this.countMax)
        {
            return;
        }

        for (var i = this.list.length - 1; i >= 0; i--)
        {
            var item = this.list[i];
            globalSystem.houseManager.pushItem(item, false);
            this.list = List.remove(this.list, this.list[i]);

            if (this.count <= this.countMax)
            {
                break;
            }
        }
    }

    pushTemporary(item)
    {
        this.temporary.push(item);
    }

    lostTemporary()
    {
        for (var item of this.temporary)
        {
            // 収納棚に送られたものを除去
            globalSystem.houseManager.lostItem(item);
        }
        this.temporary = [];
    }

    resetTemporary()
    {
        this.temporary = [];
    }

    isTemporary(item)
    {
        for (var temporary of this.temporary)
        {
            if (temporary == item)
            {
                return true;
            }
        }
        return false;
    }

    getTemporaryByType(type)
    {
        var result = [];
        for (var item of this.temporary)
        {
            if (item.type == type)
            {
                result.push(item);
            }
        }
        return result;
    }

    onQuestStart(survivor)
    {
        for (var item of this.list)
        {
            switch (item.type)
            {
                case "map":
                case "photo":
                    {
                        ItemExecutor.apply(item, survivor, false);
                    }
                    break;
                default:
                    break;
            }
        }
    }

    onQuestEnd(survivor, complete)
    {
        for (var item of this.list)
        {
            switch (item.type)
            {
                case "photo":
                case "eventArrivedLocation":
                    {
                        if (complete)
                        {
                            // 今回手に入れたアイテムならスキップ
                            if (this.isTemporary(item))
                            {
                                break;
                            }
                            ItemExecutor.apply(item, survivor, false);
                        }
                    }
                    break;
                default:
                    break;
            }
        }
    }

    onArrivedLocation(survivor, location)
    {
        var overwriteLocationUsed = false;
        var eventOccurred = false;
        var trapUsed = false;
        for (var item of this.list)
        {
            switch (item.type)
            {
                case "map":
                    {
                        if (overwriteLocationUsed == false)
                        {
                            var result = ItemExecutor.apply(item, survivor, true);
                            if (result == ItemExecutor.applyResult.use)
                            {
                                overwriteLocationUsed = true;
                            }
                        }
                    }
                    break;
                case "eventArrivedLocation":
                    {
                        if (eventOccurred == false)
                        {
                            var result = ItemExecutor.apply(item, survivor, true);
                            if (result == ItemExecutor.applyResult.use)
                            {
                                eventOccurred = true;
                            }
                        }
                    }
                    break;
                case "trap":
                    {
                        if (trapUsed == false)
                        {
                            var result = ItemExecutor.apply(item, survivor, true);
                            if (result == ItemExecutor.applyResult.use)
                            {
                                trapUsed = true;
                            }
                        }
                    }
                    break;
                default:
                    break;
            }
        }
    }

    onArrivedLocationBefore(survivor, location)
    {
        var overwriteLocationUsed = false;
        for (var item of this.list)
        {
            switch (item.type)
            {
                case "photo":
                    {
                        if (overwriteLocationUsed == false)
                        {
                            var result = ItemExecutor.apply(item, survivor, true);
                            if (result == ItemExecutor.applyResult.use)
                            {
                                overwriteLocationUsed = true;
                            }
                        }
                    }
                    break;
                default:
                    break;
            }
        }
    }
}
