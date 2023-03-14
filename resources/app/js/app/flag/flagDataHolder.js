class FlagDataHolder extends DataHolder
{
    constructor()
    {
        super("flagData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/flag/flagData.csv"]);
    }

    getDatasByTiming(timing)
    {
        var result = this.getDatasByWhere((data) =>
        {
            if (data.timing != timing)
            {
                return false;
            }
            return true;
        });

        return result;
    }
}

new FlagDataHolder();