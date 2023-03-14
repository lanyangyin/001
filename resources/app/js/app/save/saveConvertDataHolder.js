class SaveConvertDataHolder extends DataHolder
{
    constructor()
    {
        super("saveConvertData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/system/saveConvertData.csv"]);
    }
}

new SaveConvertDataHolder();
