class EventTableDataHolder extends DataHolder
{
    constructor()
    {
        super("eventData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/event/eventTableData.csv"]);
    }

    getRandom(location, rarity, level)
    {
        var list = this.getDatas(location, rarity, level);
        list = Random.shuffle(list);

        var sum = 0;
        for (var data of list)
        {
            sum += parseFloat(data.ratio);
        }

        sum = sum * 100;
        var rand = Random.range(sum);
        var current = 0;
        for (var data of list)
        {
            current += parseFloat(data.ratio) * 100;
            if (current > rand)
            {
                return data;
            }
        }
        return null;
    }

    getDatas(location, rarity, level)
    {
        var result = this.getDatasByWhere((data) =>
        {
            if (StringExtension.isNullOrEmpty(data.location) == false)
            {
                if (data.location != location)
                {
                    return false;
                }
            }
            if (parseFloat(data.ratio) == 0)
            {
                return false;
            }
            if (parseInt(data.rarity) > parseInt(rarity))
            {
                return false;
            }
            if (parseInt(data.level) > parseInt(level))
            {
                return false;
            }
            return true;
        });

        return result;
    }
}

new EventTableDataHolder();
