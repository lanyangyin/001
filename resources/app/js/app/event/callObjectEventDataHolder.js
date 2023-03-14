class CallObjectEventDataHolder extends DataHolder
{
    constructor()
    {
        super("callObjectData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/event/callObjectEventData.csv"]);
    }
}

new CallObjectEventDataHolder();
