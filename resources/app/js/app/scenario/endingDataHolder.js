class EndingDataHolder extends DataHolder
{
    constructor()
    {
        super("endingData");
    }

    setup()
    {
        this.setupPath([
            "resources/data/default/scenario/endingData.csv",
        ]);
    }
}

new EndingDataHolder();
