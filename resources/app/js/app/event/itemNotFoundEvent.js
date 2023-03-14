class ItemNotFoundEvent extends Event
{
    constructor()
    {
        super("itemNotFound", 0, 1);
    }

    executeEvent(survivor, stage)
    {
        survivor.speak(this.type, []);
        return true;
    }

    exitEvent(survivor, stage)
    {
        globalSystem.cameraManager.focusReset();
    }
}