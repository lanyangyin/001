class InsertStageEventsEvent extends Event
{
    constructor(args)
    {
        super("insertStageEvents", 1, -1);

        this.ratio = Number(args[0]);
        this.enterSpeakId = args[1];
        this.exitSpeakId = args[2];
        this.eventId = args[3];
        this.count = Number(args[4]);

        this.isCanceled = false;
    }

    get tags()
    {
        var result = [];
        var event = EventGenerator.generateById(this.eventId);
        if (event != null)
        {
            result = result.concat(event.tags);
        }
        return result;
    }

    setupEvent(survivor, stage)
    {
        if (this.isCanceled)
        {
            return;
        }

        var random = Random.range(100) / 100.0;
        if (random >= parseFloat(this.ratio))
        {
            return;
        }

        if (stage == null)
        {
            return;
        }

        survivor.speak(this.enterSpeakId, []);

        var exitSpeak = new SpeakEvent([this.exitSpeakId, null, null, 2]);
        stage.insertEvent(exitSpeak);
        for (var i = 0; i < this.count; i++)
        {
            var event = EventGenerator.generateById(this.eventId);
            if (event == null)
            {
                continue;
            }

            stage.insertEvent(event);
        }
    }

    cancel()
    {
        this.isCanceled = true;
    }

    getProbability(survivor, stage)
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
