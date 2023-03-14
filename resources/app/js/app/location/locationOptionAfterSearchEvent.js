class LocationOptionAfterSearchEvent extends LocationOption
{
    constructor(args)
    {
        super(args);

        this.ratio = parseFloat(args[0]);
        this.stageDescribe = args[1];
        this.eventId = args[2];
        this.executed = false;
        this.findCallStageId = -1;
    }

    setupOption(location)
    {
        // 一定確率で無効にする
        var random = Random.range(100) / 100.0;
        if (random > this.ratio)
        {
            this.executed = true;
        }
    }

    executeOption(location)
    {
        if (this.executed)
        {
            return;
        }

        for (var stage of location.stages)
        {
            if (stage.visitCount == 0)
            {
                continue;
            }
            if (StringExtension.isValid(this.stageDescribe))
            {
                if (stage.data.describe != this.stageDescribe)
                {
                    continue;
                }
            }
            if (this.hasCallObjectEvent(stage))
            {
                this.findCallStageId = stage.id;
                continue;
            }
            else
            {
                if (stage.id != this.findCallStageId)
                {
                    continue;
                }
            }

            var event = EventGenerator.generateById(this.eventId);
            if (event != null)
            {
                stage.pushEvent(event);
            }
            this.executed = true;
            break;
        }
    }

    hasCallObjectEvent(stage)
    {
        var calls = stage.getEventsByType(CallObjectEvent);
        if (calls.length > 0)
        {
            return true;
        }

        return false;
    }
}
