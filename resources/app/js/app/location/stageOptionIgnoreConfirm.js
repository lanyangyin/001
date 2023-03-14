class StageOptionIgnoreConfirm extends StageOption
{
    constructor()
    {
        super();
    }

    executeOption(survivor, stage)
    {
        var currentEvent = survivor.eventExecutor.currentEvent;
        if (currentEvent != null)
        {
            this.cancelEvent(currentEvent);
        }

        for (var event of survivor.eventExecutor.nextEvents)
        {
            this.cancelEvent(event);
        }

        for (var i = stage.events.length - 1; i >= 0; i--)
        {
            var event = stage.events[i];
            if (this.isConfirm(event))
            {
                this.cancelEvent(event);
                stage.events = List.remove(stage.events, event);
            }
        }
    }

    isConfirm(event)
    {
        if (event == null)
        {
            return false;
        }
        var result = (event instanceof ConfirmEvent) || (event instanceof SelectionEvent);
        return result;
    }

    cancelEvent(event)
    {
        if (this.isConfirm(event))
        {
            event.cancel();
        }

        var count = event.beforeEvents.length;
        for (var i = count - 1; i >= 0; i--)
        {
            var before = event.beforeEvents[i];
            if (this.isConfirm(before))
            {
                event.beforeEvents.splice(i, 1);
            }
        }
    }
}
