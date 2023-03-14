class ItemDataHolder extends DataHolder
{
    constructor()
    {
        super("itemData");
    }

    get isGetShallowCopy()
    {
        return true;
    }

    setup()
    {
        this.setupPath(["resources/data/default/item/itemData.csv"]);
    }

    onShallowCopied(data)
    {
        ItemExecutor.init(data);
        return data;
    }

    getRandom(rarity, stage = null)
    {
        var result = this.getRandomByWhere((data) =>
        {
            return true;
        }, rarity, stage);

        return result;
    }

    getRandomByTags(tags, rarity = -1, stage = null)
    {
        var correct = [];
        for (var tag of tags)
        {
            var item = this.getRandomByWhere((data) =>
            {
                var hasTag = (data.tag == tag);
                return hasTag;
            }, rarity, stage);

            if (item == null)
            {
                continue;
            }
            correct.push(item);
        }

        var index = Random.range(correct.length);
        var result = correct[index];
        return result;
    }

    getRandomByType(type, rarity, stage)
    {
        var result = this.getRandomByWhere((data) =>
        {
            if (data.type != type)
            {
                return false;
            }
            return true;
        }, rarity, stage);

        return result;
    }

    getRandomByWhere(whereArg, rarity = -1, stage = null)
    {
        var where = (data) =>
        {
            if (parseInt(data.rarity) == -1)
            {
                return false;
            }
            if (rarity > 0 && parseInt(data.rarity) > parseInt(rarity))
            {
                return false;
            }

            var area = globalSystem.areaManager.area;
            if (area != null && StringExtension.isValid(data.area))
            {
                if (data.area != area)
                {
                    return false;
                }
            }

            var result = whereArg(data);
            return result;
        };

        var correct = this.getDatasByWhere(where);
        if (correct.length == 0)
        {
            rarity = -1;
            correct = this.getDatasByWhere(where);
        }
        if (correct.length == 0)
        {
            return null;
        }

        var location = globalSystem.locationManager.location;
        if (stage != null && location != null && StringExtension.isValid(location.data.prioritizeItem))
        {
            for (var item of correct)
            {
                if (item.id == location.data.prioritizeItem)
                {
                    return item;
                }
            }
        }

        if (stage != null && StringExtension.isValid(stage.data.prioritizeItemTag))
        {
            for (var item of correct)
            {
                if (item.tag == stage.data.prioritizeItemTag)
                {
                    return item;
                }
            }
        }

        correct = Random.shuffle(correct);
        var result = correct[0];
        for (var item of correct)
        {
            var random = Random.range(100) / 100;
            var ratio = parseFloat(item.ratio);
            if (random < ratio)
            {
                result = item;
                break;
            }
        }

        return result;
    }

    getCategory()
    {
        var result = [];
        var list = this.getDatasByWhere((data) => { return true; });
        for (var data of list)
        {
            if (result.indexOf(data.category) == -1)
            {
                result.push(data.category);
            }
        }
        return result;
    }
}

new ItemDataHolder();
