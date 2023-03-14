class StageObjectSecondaryDescribeEvent extends Event
{
    constructor()
    {
        super("stageObjectSecondaryDescribe", 0, 1);
    }

    executeEvent(survivor, stage)
    {
        var callObjects = stage.getEventsByType(CallObjectEvent);
        if (callObjects.length == 0)
        {
            return true;
        }

        var list = globalSystem.stageDescribeData.getDatasByType("secondary", callObjects.length);
        if (list == null)
        {
            return true;
        }
        if (list.length == 0)
        {
            return true;
        }

        var data = list[0];
        if (data == null)
        {
            return true;
        }

        var names = [];
        for (var event of callObjects)
        {
            var item = event.object;
            var keywordLength = item.keyword.length;
            var keywordIndex = item.name.indexOf(item.keyword);
            var name = item.name.slice(0, keywordIndex) + "<button>" + item.keyword + "</button>" + item.name.slice(keywordIndex + keywordLength);
            names.push(name);
        }

        survivor.describe(data.text, names);

        return true;
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
