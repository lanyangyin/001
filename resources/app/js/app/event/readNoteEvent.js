class ReadNoteEvent extends Event
{
    constructor(arg)
    {
        super("readNote", 0, 1);
    }

    static get describeId()
    {
        return "note";
    }

    executeEvent(survivor, stage)
    {
        if (globalSystem.locationManager.location.isUsedDescribe(ReadNoteEvent.describeId))
        {
            return true;
        }

        var data = globalSystem.noteData.getRandom(stage.type);
        if (data == null)
        {
            return true;
        }

        survivor.speak(this.type, [data.object, data.text]);
        globalSystem.locationManager.location.notifyUsedDescribe(ReadNoteEvent.describeId);
        return true;
    }
}
