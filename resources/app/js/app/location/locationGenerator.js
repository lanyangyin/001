class LocationGenerator
{
    static getPrefix(index)
    {
        var id = `stagePrefix_${index}`;
        var result = Terminology.get(id);
        if (result == null)
        {
            return "";
        }
        return result;
    }

    static generate(data)
    {
        var result = new Location(data);

        // ステージ登録
        var stageList = globalSystem.stageData.getDatasByKey("type", data.type);
        stageList = Random.shuffle(stageList);
        for (var id of data.fixedStages)
        {
            if (StringExtension.isNullOrEmpty(id))
            {
                continue;
            }
            var fixedStage = globalSystem.stageData.getDataById(id);
            if (fixedStage == null)
            {
                continue;
            }
            stageList.unshift(fixedStage);
        }
        result = LocationGenerator.createStages(result, stageList, data, 0, null);

        // 各ステージのイベント登録
        for (var i = 0; i < result.stages.length; i++)
        {
            var stage = result.stages[i];

            // 汎用イベント
            var eventCount = parseInt(data.stageEventCount);
            for (var j = 0; j < eventCount; j++)
            {
                var eventData = globalSystem.eventData.getRandom(data.type, data.eventRarity, data.enemyLevel);
                if (eventData == null)
                {
                    continue;
                }

                var event = EventGenerator.generateByData(eventData);
                if (event == null)
                {
                    continue;
                }
                stage.pushEvent(event);
            }
        }

        result.onGenerated(data);

        return result;
    }

    static createStages(location, stageList, data, index, prevStage)
    {
        if (index >= stageList.length)
        {
            return location;
        }

        // 前の部屋情報
        var prevData = null;
        var depth = 1;
        if (prevStage != null)
        {
            prevData = prevStage.data;
            depth = prevStage.depth + 1;
        }

        // ステージ基本情報
        var stageData = stageList[index];
        var stage = new Stage(index, depth, stageData, location);
        location.stages.unshift(stage);

        //  移動先
        var isDepthOver = (depth >= data.stageCount);
        if (isDepthOver)
        {
            stage.nextIndex = [-1];
        }
        else
        {
            var bridgeCount = Number(stageData.bridgeCount);
            for (var i = 0; i < bridgeCount; i++)
            {
                var nextIndex = location.stages.length;
                if (nextIndex < stageList.length)
                {
                    stage.nextIndex.unshift(nextIndex);
                    location = LocationGenerator.createStages(location, stageList, data, nextIndex, stage);
                }
                else
                {
                    stage.nextIndex.unshift(-1);
                    break;
                }
            }
        }

        return location;
    }
}