class StageDataHolder extends DataHolder
{
    constructor()
    {
        super("stageData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/location/stageData.csv"]);
    }

    getRandomByType(type, ignore)
    {
        var result = this.getDatasByWhere((item) => { return (item.type == type && item != ignore); });
        if (result.length == 0)
        {
            return null;
        }
        var index = Random.range(result.length);
        return result[index];
    }
}

new StageDataHolder();
