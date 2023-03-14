class SurvivorDataHolder extends DataHolder
{
    constructor()
    {
        super("survivorData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/character/survivorData.csv"]);
        this.setupSubPath(["resources/data/eng/character/survivorData.csv"]);
    }
}

new SurvivorDataHolder();
