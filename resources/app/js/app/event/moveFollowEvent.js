class MoveFollowEvent extends Event
{
    constructor(nextIndex, preSpeak)
    {
        super("moveFollow", 3, -1);
        this.nextStageIndex = nextIndex;
        this.preSpeak = preSpeak;
    }

    setupEvent(survivor, stage)
    {
        if (this.preSpeak)
        {
            var next = globalSystem.locationManager.getStage(this.nextStageIndex);
            survivor.speak("moveFollow", [next.bridge]);
            var fg = globalSystem.uiManager.foreground.getElement(survivor.image);
            if (fg != null)
            {
                var walkTime = 1;
                var newFg = globalSystem.uiManager.foreground.addImage(fg.id, ForegroundElement.defaultType, fg.costume, fg.positionType, walkTime);
                if (newFg != null)
                {
                    newFg.walkOut(walkTime, true);
                }
            }

            this.waitTime = 1;
        }
    }

    executeEvent(survivor, stage)
    {
        if (this.waitTime > 0)
        {
            this.waitTime -= globalSystem.time.deltaTime;
            return false;
        }

        var next = globalSystem.locationManager.getStage(this.nextStageIndex);
        /*
        if (next.locked)
        {
            return true;
        }
        */

        if (this.preSpeak)
        {
            var fg = globalSystem.uiManager.foreground.getElement(survivor.image);
            if (fg != null)
            {
                var walkTime = 1;
                var newFg = globalSystem.uiManager.foreground.addImage(fg.id, ForegroundElement.defaultType, fg.costume, fg.positionType, walkTime);
                if (newFg != null)
                {
                    newFg.walkIn(walkTime, true);
                }
            }
        }

        survivor.setStage(next);
        return true;
    }

    isContinuable()
    {
        return true;
    }
}
