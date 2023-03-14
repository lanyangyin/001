class StageDescribeDataHolder extends DataHolder
{
    constructor()
    {
        super("stageDescribeData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/location/stageDescribeData.csv"]);
    }

    getDatasByType(stage, count = null)
    {
        var result = this.getDatasByWhere((data) =>
        {
            if (StringExtension.isNullOrEmpty(data.stage) == false)
            {
                if (data.stage != stage)
                {
                    return false;
                }
            }
            if (count != null)
            {
                if (Number(data.count) != count)
                {
                    return false;
                }
            }
            return true;
        });

        result = Random.shuffle(result);

        result.sort((a, b) =>
        {
            return Number(b.priority) - Number(a.priority);
        });

        return result;
    }
}

new StageDescribeDataHolder();
