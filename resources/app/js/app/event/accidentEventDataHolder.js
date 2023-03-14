class AccidentEventDataHolder extends DataHolder
{
    constructor()
    {
        super("accidentData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/event/accidentEventData.csv"]);
    }
}

new AccidentEventDataHolder();
