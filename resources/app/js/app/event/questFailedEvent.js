class QuestFailedEvent extends QuestEndEvent
{
    constructor(speak = true, waitTime = 2)
    {
        super("questFailed", waitTime, -1);
        this.speak = speak;
    }

    setupEvent(survivor, stage)
    {
        globalSystem.survivorManager.lock(survivor);
    }

    executeEvent(survivor, stage)
    {
        if (this.speak)
        {
            //survivor.speak(this.type, []);
            //globalSystem.cameraManager.focusResetFg();
        }

        survivor.pushEvent(new GameOverEvent(), Event.executeType.event);

        return true;
    }

    isSkipTimer()
    {
        return true;
    }

    isUseSurvivorSpeed()
    {
        return false;
    }

    getUseStamina()
    {
        return 0;
    }
}
