class EscapeLocationEvent extends Event
{
    constructor(args)
    {
        super("escapeLocation", 3, 1);
    }

    setupEvent(survivor, stage)
    {
        survivor.speak("escapeLocation", []);
        globalSystem.questManager.success(false);
    }

    executeEvent(survivor, stage)
    {
        return true;
    }
}
