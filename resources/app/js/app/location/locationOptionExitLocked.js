class LocationOptionExitLocked extends LocationOption
{
    constructor(args)
    {
        super(args);

        this.ratio = Number(args[0]);
        this.lockedKey = args[1];
        this.keyCount = Number(args[2]);

        this.enabled = false;
    }

    get keyGetEvent()
    {
        var data = globalSystem.locationFlagData.getDataById(this.lockedKey);
        if (data == null)
        {
            return null;
        }
        return data.eventId;
    }

    setupOption(location)
    {
        var random = Random.range(100) / 100.0;
        if (random < parseFloat(this.ratio))
        {
            this.enabled = true;
            this.pushKeyGetEvent(location);
        }
    }

    onVisit(location, stage)
    {
        if (this.enabled == false)
        {
            return;
        }

        if (location.hasFlag(this.lockedKey))
        {
            return;
        }

        var keyGetStage = this.getKeyGetStage(location);
        if (keyGetStage != null)
        {
            if (this.hasCallObjectEvent(keyGetStage) == false)
            {
                keyGetStage.pushEvent(new StageObjectDescribeEvent([2, 1]));
            }
            return;
        }

        this.pushKeyGetEvent(location);
    }

    getKeyGetStage(location)
    {
        for (var stage of location.stages)
        {
            for (var result of stage.overwriteSearchResults)
            {
                if (result == this.keyGetEvent)
                {
                    return stage;
                }
            }
        }
        return null;
    }

    hasCallObjectEvent(stage)
    {
        var describes = stage.getEventsByType(StageObjectDescribeEvent);
        if (describes.length > 0)
        {
            return true;
        }

        var calls = stage.getEventsByType(CallObjectEvent);
        if (calls.length > 0)
        {
            return true;
        }

        return false;
    }

    pushKeyGetEvent(location)
    {
        var indexList = [];
        for (var i = 0; i < location.stages.length; i++)
        {
            indexList.push(i);
        }
        indexList = Random.shuffle(indexList);

        var count = 1 + Random.range(this.keyCount);
        for (var i = 0; i < count; i++)
        {
            var index = indexList[i];
            var stage = location.stages[index];
            if (stage == null)
            {
                continue;
            }

            stage.clearOverwriteSearchResults();
            var nullCount = Random.range(GlobalParam.get("lockedKeyDummyCount"));
            for (var j = 0; j < nullCount; j++)
            {
                // 「必ず1回目のSearchEventで見つかる」を防ぐため、nullを入れてランダムにする
                stage.pushOverwriteSearchResult(null);
            }
            stage.pushOverwriteSearchResult(this.keyGetEvent);
        }
        location.lockedKey = this.lockedKey;
    }
}
