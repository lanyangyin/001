class AvoidEvent extends AccessObjectEvent
{
    constructor(callObjectEvent)
    {
        super("avoid", 3, 1, callObjectEvent);
        this.word = this.object.keyword;
    }

    setupEvent(survivor, stage)
    {
        if (this.executeType == Event.executeType.call)
        {
            survivor.speak("callAvoid", [this.word]);
        }
        else
        {
            survivor.speak("avoid", [this.word]);
        }
    }

    executeEvent(survivor, stage)
    {
        for (var event of stage.events)
        {
            if ((event instanceof CallObjectEvent) == false)
            {
                continue;
            }

            if (event.object == this.object)
            {
                event.valid = false;
            }
        }

        return true;
    }
}
