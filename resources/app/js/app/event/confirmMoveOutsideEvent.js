class ConfirmMoveOutsideEvent extends ConfirmEvent
{
    constructor(callWords)
    {
        super(-1);
        this.callWords = callWords;
        this.done = false;
    }

    setupEvent(survivor, stage)
    {
        var hasEvent = false;
        if (stage != null)
        {
            for (var event of stage.events)
            {
                if (event == null)
                {
                    continue;
                }
                if (event == this)
                {
                    continue;
                }
                var probability = event.getProbability(survivor, stage);
                if (probability <= 0)
                {
                    continue;
                }
                if ((event instanceof CallObjectEvent) == false)
                {
                    continue;
                }
                hasEvent = true;
            }
            if (hasEvent == false)
            {
                survivor.speak("completeSearch", []);
            }
        }

        this.done = false;

        super.setupEvent(survivor, stage);
    }

    getYesInputs()
    {
        return ["yes", "go"];
    }

    getNoInputs()
    {
        return ["no", "search"];
    }

    onYes(survivor, stage)
    {
        this.done = true;

        var moveOutside = new MoveOutsideEvent();
        moveOutside.broken = stage.exitBroken;
        if (moveOutside.broken)
        {
            this.done = false;
        }
        if (moveOutside.isLocked)
        {
            this.done = false;
        }

        survivor.pushEvent(moveOutside, Event.executeType.event);
        this.target = survivor;
    }

    onNo(survivor, stage)
    {
        survivor.speak("continueSearch", []);
        this.done = false;
    }

    getConfirmSpeakId(survivor, stage)
    {
        return "confirmMoveOutside";
    }

    getConfirmSpeakArg(survivor, stage)
    {
        var word = this.callWords[0];
        return [word];
    }

    getProbability()
    {
        if (this.done)
        {
            return 0;
        }
        return 0.1;
    }

    isContinuable()
    {
        return true;
    }

    isSkippable(survivor, stage)
    {
        return true;
    }
}