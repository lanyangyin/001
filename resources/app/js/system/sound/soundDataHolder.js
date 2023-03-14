class SoundDataHolder extends DataHolder
{
    constructor()
    {
        super("soundData");
    }

    setup()
    {
        this.setupPath(
            [
                "resources/data/default/sound/soundData.csv",
            ]);
    }
}

new SoundDataHolder();
