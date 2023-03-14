class ForegroundDataHolder extends DataHolder
{
    constructor()
    {
        super("foregroundData");
    }

    setup()
    {
        this.setupPath(
            [
                "resources/data/default/ui/foregroundLayoutData.csv",
                "resources/data/default/ui/foregroundData.csv",
            ]);
    }

    getLayout(id)
    {
        var list = this.dicts[0][id];
        if (list == null)
        {
            return null;
        }
        if (list.length == 0)
        {
            return null;
        }
        return list[0];
    }

    getData(id, type, costume)
    {
        if (StringExtension.isNullOrEmpty(type))
        {
            type = ForegroundElement.defaultType;
        }
        if (StringExtension.isNullOrEmpty(costume))
        {
            costume = ForegroundElement.defaultCostume;
        }

        var result = this.getDataByWhere((item) => { return (item.id == id && item.type == type && item.costume == costume); });
        if (result != null)
        {
            return result;
        }

        var defaultData = this.getDataByWhere((item) => { return (item.id == id); });
        return defaultData;
    }
}

new ForegroundDataHolder();
