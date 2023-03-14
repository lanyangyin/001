class InteractEventDataHolder extends DataHolder
{
    constructor()
    {
        super("interactData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/event/interactEventData.csv"]);
    }
}

new InteractEventDataHolder();
