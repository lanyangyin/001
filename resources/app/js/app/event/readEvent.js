class ReadEvent extends Event
{
    constructor(arg)
    {
        super("read", 0, -1);

        this.arg = arg;
    }

    executeEvent(survivor, stage)
    {
        survivor.speak(this.type, this.arg);
        return true;
    }
}
