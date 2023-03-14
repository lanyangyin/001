class StageObjectDataHolder extends DataHolder
{
    constructor()
    {
        super("stageObjectData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/location/stageObjectData.csv"]);
    }

    getDatasByStage(types, tags, rarity)
    {
        rarity = parseInt(rarity);
        var correct = this.getDatasByWhere((data) =>
        {
            if (List.contains([data.type], types) == false)
            {
                return false;
            }
            if (List.contains(data.tags, tags, true) == false)
            {
                return false;
            }
            if (parseFloat(data.ratio) == 0)
            {
                return false;
            }
            if (parseInt(data.rarity) > rarity)
            {
                return false;
            }
            return true;
        });

        return correct;
    }

    getRandomBySize(size, types)
    {
        size = parseInt(size);
        var correct = this.getDatasByWhere((data) =>
        {
            if (List.contains([data.type], types) == false)
            {
                return false;
            }
            if (parseFloat(data.ratio) == 0)
            {
                return false;
            }
            if (parseInt(data.size) != size)
            {
                return false;
            }
            return true;
        });

        if (correct.length == 0)
        {
            return null;
        }

        var index = Random.range(correct.length);
        var result = correct[index];
        return result;
    }
}

new StageObjectDataHolder();
