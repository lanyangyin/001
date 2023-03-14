class CameraEffectDataHolder extends DataHolder
{
    constructor()
    {
        super("cameraData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/effect/cameraEffectData.csv"]);
    }

    getDataByRandom(type)
    {
        var correct = this.getDatasByKey("type", type);
        if (correct.length == 0)
        {
            return null;
        }

        var inedx = Random.range(correct.length);
        var result = correct[inedx];

        return result;
    }
}

new CameraEffectDataHolder();