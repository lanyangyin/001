class LocationOptionEarlyExit extends LocationOption
{
    constructor(args)
    {
        super(args);

        this.speakId = args[0];
    }

    setupOption(location)
    {
        for (var stage of location.stages)
        {
            if (stage.id == 0)
            {
                continue;
            }
            var event = new ForceQuestSuccessEvent([this.speakId]);
            stage.pushEvent(event);
        }
    }
}
