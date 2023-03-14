class ArrivedLocationBeforeEvent extends Event
{
    constructor()
    {
        super("arrivedLocationBefore", 0, 1);
    }

    setupEvent(survivor, stage)
    {
        var quest = globalSystem.questManager.currentQuest;
        var location = globalSystem.locationManager.location;
        survivor.onArrivedLocationBefore(location);
        if (EndlessSystem.isEndless(quest))
        {
            globalSystem.endlessManager.onArrivedLocationBefore(survivor, location);
        }
    }

    executeEvent(survivor, stage)
    {
        return true;
    }
}