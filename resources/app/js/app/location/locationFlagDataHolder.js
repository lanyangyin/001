class LocationFlagDataHolder extends DataHolder
{
    constructor()
    {
        super("locationFlagData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/location/locationFlagData.csv"]);
    }
}

new LocationFlagDataHolder();
