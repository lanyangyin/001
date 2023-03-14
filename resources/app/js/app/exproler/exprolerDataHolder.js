class ExprolerDataHolder extends DataHolder
{
    constructor()
    {
        super("exprolerData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/ui/exprolerData.csv"]);
    }

    onLoad()
    {

    }

    getDataByDate(date)
    {
        var result = this.getDataByWhere((data) => { return (data.date == date); });
        return result;
    }
}

new ExprolerDataHolder();
