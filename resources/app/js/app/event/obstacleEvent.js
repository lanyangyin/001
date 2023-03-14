class ObstacleEvent extends Event
{
    constructor(args)
    {
        super("obstacle", 0, 1);

        this.objectTypes = args;
        this.data = null;
        this.events = [];

        var list = globalSystem.obstacleData.getDatasByWhere((data) =>
        {
            for (var type of this.objectTypes)
            {
                if (StringExtension.isNullOrEmpty(data.type))
                {
                    return true;
                }
                if (data.type == type)
                {
                    return true;
                }
            }
            return false;
        });
        if (list.length == 0)
        {
            return;
        }
        var index = Random.range(list.length);
        this.data = list[index];

        if (this.data != null)
        {
            for (var id of this.data.events)
            {
                if (StringExtension.isNullOrEmpty(id))
                {
                    continue;
                }
                var event = EventGenerator.generateById(id);
                if (event == null)
                {
                    continue;
                }
                this.events.push(event);
            }
        }
    }

    get tags()
    {
        var result = [];
        for (var event of this.events)
        {
            result = result.concat(event.tags);
        }
        return result;
    }

    setupEvent(survivor, stage)
    {
        if (this.data == null)
        {
            return;
        }

        survivor.speak(this.data.speakType, [this.data.name]);

        for (var event of this.events)
        {
            survivor.insertEvent(event, Event.executeType.event);
        }
    }

    executeEvent(survivor, stage)
    {
        return true;
    }

    describe(survivor, object)
    {
        if (this.data == null)
        {
            return;
        }
        survivor.describe(this.data.describe, [object.keyword]);
    }

    isContinuable()
    {
        return true;
    }

    getUseStamina()
    {
        if (this.data == null)
        {
            return 0;
        }
        return this.data.useStamina;
    }
}
