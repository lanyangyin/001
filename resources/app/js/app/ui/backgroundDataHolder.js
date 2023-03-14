class BackgroundDataHolder extends DataHolder
{
    constructor()
    {
        super("backgroundData");
    }

    setup()
    {
        this.setupPath(
            [
                "resources/data/default/ui/backgroundData.csv",
            ]);
    }
}

new BackgroundDataHolder();
