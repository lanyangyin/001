class CompleteAreaEvent extends Event
{
    constructor(args)
    {
        super("completeArea", 2, 1);

        this.speak = Type.toBoolean(args[0]);
        this.eventId = args[1];
    }

    executeEvent(survivor, stage)
    {
        if (StringExtension.isValid(this.eventId))
        {
            var event = EventGenerator.generateById(this.eventId);
            if (event != null)
            {
                survivor.pushEvent(event, Event.executeType.event);
            }
        }
        survivor.pushEvent(new ReturnGatewayEvent(this.speak, true), Event.executeType.event);
        return true;
    }

    getUseStamina()
    {
        return 0;
    }
}
