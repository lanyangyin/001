class TitleDataHolder extends DataHolder
{
    constructor()
    {
        super("titleData");
    }

    setup()
    {
        this.setupPath(
            [
                "resources/data/default/ui/titleData.csv",
            ]);
    }
}

new TitleDataHolder();
