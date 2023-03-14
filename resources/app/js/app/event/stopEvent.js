class StopEvent extends Event
{
    constructor(arg)
    {
        super("stop", 0, -1);
    }

    executeEvent(survivor, stage)
    {
        return false;
    }
}
