class LocationDataHolder extends DataHolder
{
    constructor()
    {
        super("locationData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/location/locationData.csv"]);
    }
}

new LocationDataHolder();
