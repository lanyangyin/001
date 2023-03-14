class EndrollDataHolder extends DataHolder
{
    constructor()
    {
        super("endrollData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/system/endrollData.csv"]);
    }
}

new EndrollDataHolder();