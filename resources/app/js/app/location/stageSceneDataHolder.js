class StageSceneDataHolder extends DataHolder
{
    constructor()
    {
        super("stageSceneData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/location/stageSceneData.csv"]);
    }

    getDatasByStage(stage)
    {
        var correct = this.getDatasByWhere((data) =>
        {
            if (StringExtension.isNullOrEmpty(data.stage) == false)
            {
                if (data.stage != stage)
                {
                    return false;
                }
            }
            return true;
        });

        var result = Random.shuffle(correct);
        return result;
    }
}

new StageSceneDataHolder();
