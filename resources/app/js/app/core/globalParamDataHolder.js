class GlobalParamDataHolder extends DataHolder
{
    constructor()
    {
        super("globalParamData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/system/globalParamData.csv"]);
    }
}

new GlobalParamDataHolder();


class GlobalParam
{
    static get(id)
    {
        var data = globalSystem.globalParamData.getDataById(id);
        if (data == null)
        {
            return null;
        }
        var result = null;
        switch (data.type)
        {
            case "number":
                {
                    result = Number(data.value);
                }
                break;
            case "ratio":
                {
                    var ratio = Number(data.value);
                    var random = Random.range(100) / 100.0;
                    result = (random < ratio);
                }
                break;
            default:
                break;
        }
        return result;
    }
}

