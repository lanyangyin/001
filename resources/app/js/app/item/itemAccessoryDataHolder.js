class ItemAccessoryDataHolder extends DataHolder
{
    constructor()
    {
        super("itemAccessoryData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/item/itemAccessoryData.csv"]);
    }

    getRandomByType(type)
    {
        var correct = this.getDatasByWhere((data) =>
        {
            if (Number(data.ratio) == -1)
            {
                return false;
            }
            if (data.type != type)
            {
                return false;
            }
            return true;
        });

        if (correct.length == 0)
        {
            return null;
        }

        correct = Random.shuffle(correct);
        var result = correct[0];
        for (var item of correct)
        {
            var ratio = Random.range(100) / 100;
            if (ratio < parseFloat(item.ratio))
            {
                result = item;
                break;
            }
        }

        return result;
    }
}

new ItemAccessoryDataHolder();
