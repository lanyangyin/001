class LocationOptionSpeak extends LocationOption
{
    constructor(args)
    {
        super(args);

        this.speakId = args[0];
        this.isMainOnly = Type.toBoolean(args[1]);
    }

    setupOption(location)
    {
        var length = location.stages.length;
        var index = Random.range(length);
        var stage = location.stages[index];
        if (stage != null)
        {
            var event = new SpeakEvent([this.speakId]);

            if (this.isMainOnly)
            {
                var main = globalSystem.survivorManager.mainSurvivor;
                event.target = main;
            }

            stage.pushEvent(event);
        }
    }
}
