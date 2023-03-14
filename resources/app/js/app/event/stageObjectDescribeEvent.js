class StageObjectDescribeEvent extends Event
{
    constructor(args = null)
    {
        super("stageObjectDescribe", 0, 1);

        this.objectCount = null;
        this.eventProbability = 2;

        if (args != null)
        {
            this.objectCount = Number(args[0]);
            this.eventProbability = Number(args[1]);
        }
    }

    executeEvent(survivor, stage)
    {
        var stageType = stage.describe;
        var list = globalSystem.stageDescribeData.getDatasByType(stageType, this.objectCount);
        if (list == null)
        {
            return true;
        }
        if (list.length == 0)
        {
            return true;
        }

        var data = list[0];
        for (var describeData of list)
        {
            if (globalSystem.locationManager.location.isUsedDescribe(describeData.id))
            {
                continue;
            }
            data = describeData;
            break;
        }

        if (data == null)
        {
            return true;
        }

        var rarity = stage.eventRarity;
        var count = Number(data.count);
        var correct = globalSystem.stageObjectData.getDatasByStage(stage.data.objectTypes, stage.data.objectTags, rarity);
        if (correct.length < count)
        {
            return true;
        }

        var alreadyList = stage.getEventsByType(CallObjectEvent);
        correct = Random.shuffle(correct);
        var items = [];
        for (var i = 0; i < correct.length; i++)
        {
            var isAlready = false;
            for (var already of alreadyList)
            {
                if (correct[i] == already.object)
                {
                    isAlready = true;
                    break;
                }
            }
            if (isAlready)
            {
                continue;
            }

            items.push(correct[i]);
            if (items.length >= count)
            {
                break;
            }
        }

        if (items.length != count)
        {
            return true;
        }

        var names = [];
        for (var item of items)
        {
            var keywordLength = item.keyword.length;
            var keywordIndex = item.name.indexOf(item.keyword);
            var name = item.name.slice(0, keywordIndex) + "<button>" + item.keyword + "</button>" + item.name.slice(keywordIndex + keywordLength);
            names.push(name);
        }

        survivor.describe(data.text, names);

        globalSystem.locationManager.location.notifyUsedDescribe(data.id);

        var obstacleIndex = Random.range(items.length);
        for (var i = 0; i < items.length; i++)
        {
            var call = new CallObjectEvent(items[i]);
            stage.pushEvent(call);

            if (i == obstacleIndex)
            {
                survivor.insertEvent(new ObstacleDescribeEvent([call, stage]), Event.executeType.event);
            }
        }

        return true;
    }

    getProbability()
    {
        return this.eventProbability;
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
