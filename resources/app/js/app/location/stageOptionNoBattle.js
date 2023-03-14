class StageOptionNoBattle extends StageOption
{
    constructor()
    {
        super();
    }

    setupOption(stage)
    {
        this.cancelEvents(null, stage);
    }

    executeOption(survivor, stage)
    {
        this.cancelEvents(survivor, stage);
    }

    cancelEvents(survivor, stage)
    {
        if (survivor != null)
        {
            var currentEvent = survivor.eventExecutor.currentEvent;
            if (currentEvent != null)
            {
                this.cancelBattle(currentEvent);
            }

            for (var event of survivor.eventExecutor.nextEvents)
            {
                this.cancelBattle(event);
            }
        }

        for (var i = stage.events.length - 1; i >= 0; i--)
        {
            var event = stage.events[i];
            if (this.isBattle(event))
            {
                this.cancelBattle(event);
                stage.events = List.remove(stage.events, event);
            }
        }
    }

    isBattle(event)
    {
        if (event == null)
        {
            return false;
        }
        var result = event.hasTag("battle");
        return result;
    }

    cancelBattle(event)
    {
        if (this.isBattle(event))
        {
            event.cancel();
        }

        var count = event.beforeEvents.length;
        for (var i = count - 1; i >= 0; i--)
        {
            var before = event.beforeEvents[i];
            if (this.isBattle(before))
            {
                event.beforeEvents.splice(i, 1);
            }
        }
    }
}
