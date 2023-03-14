class BackgroundLightDataHolder extends DataHolder
{
    constructor()
    {
        super("backgroundLightData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/effect/backgroundLightData.csv"]);
    }
}

new BackgroundLightDataHolder();