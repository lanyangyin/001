class ArrivedLocationEvent extends Event
{
    constructor()
    {
        super("arrivedLocation", 0, 1);
    }

    setupEvent(survivor, stage)
    {
        var quest = globalSystem.questManager.currentQuest;
        var location = globalSystem.locationManager.location;
        survivor.onArrivedLocation(location);
        if (EndlessSystem.isEndless(quest))
        {
            globalSystem.endlessManager.onArrivedLocation(survivor, location);
        }
    }

    executeEvent(survivor, stage)
    {
        return true;
    }
}