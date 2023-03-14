class GameOverEvent extends Event
{
    constructor()
    {
        super("gameOver", 2, -1);
        this.executed = false;
    }

    setupEvent(survivor, stage)
    {
        globalSystem.survivorManager.lock(survivor);
    }

    executeEvent(survivor, stage)
    {
        if (this.executed == false)
        {
            globalSystem.questManager.endQuest(false);
            globalSystem.uiManager.fade.speed = 1.0;
            globalSystem.flowManager.setFlow(new GameOverFlow());
            this.executed = true;
        }
        return false;
    }

    exitEvent(survivor, stage)
    {
        globalSystem.survivorManager.unlock(survivor);
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