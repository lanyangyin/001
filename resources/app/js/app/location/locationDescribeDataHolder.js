class LocationDescribeDataHolder extends DataHolder
{
    constructor()
    {
        super("locationDescribeData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/location/locationDescribeData.csv"]);
    }

    getRandomByType(location, type)
    {
        var correct = this.getDatasByWhere((data) =>
        {
            if (StringExtension.isNullOrEmpty(data.location) == false)
            {
                if (data.location != location)
                {
                    return false;
                }
            }
            if (StringExtension.isNullOrEmpty(data.type) == false)
            {
                if (data.type != type)
                {
                    return false;
                }
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

new LocationDescribeDataHolder();
