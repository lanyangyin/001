class StageSceneDescribeEvent extends Event
{
    constructor()
    {
        super("stageSceneDescribe", 0, 1);
    }

    executeEvent(survivor, stage)
    {
        var stageType = stage.describe;
        if (stageType == null)
        {
            return true;
        }

        var data = this.getSceneData(stageType);
        if (data == null)
        {
            return true;
        }

        survivor.describe(data.text, []);
        globalSystem.locationManager.location.notifyUsedDescribe(data.id);
        return true;
    }

    getSceneData(stage)
    {
        var list = globalSystem.stageSceneData.getDatasByStage(stage);
        if (list == null)
        {
            return null;
        }

        for (var data of list)
        {
            if (globalSystem.locationManager.location.isUsedDescribe(data.id))
            {
                continue;
            }
            return data;
        }
        return list[0];
    }

    getProbability()
    {
        return 2;
    }

    isContinuable()
    {
        return true;
    }

    getUseStamina()
    {
        return 0;
    }
}
