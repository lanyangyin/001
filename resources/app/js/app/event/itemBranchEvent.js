class ItemBranchEvent extends Event
{
    constructor(args)
    {
        super("itemBranch", 0, 1);

        this.itemId = args[0];
        this.successEventId = args[1];
        this.failedEventId = args[2];
    }

    setupEvent(survivor, stage)
    {
        var item = survivor.getItemById(this.itemId);
        var event = null;
        if (item != null)
        {
            event = EventGenerator.generateById(this.successEventId);
        }
        else
        {
            event = EventGenerator.generateById(this.failedEventId);
        }

        if (event != null)
        {
            survivor.insertEvent(event, Event.executeType.event);
        }
    }

    executeEvent(survivor, stage)
    {
        return true;
    }
}