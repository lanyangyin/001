class UnlockEvent extends Event
{
    constructor(arg)
    {
        super("unlock", 2, 1);

        this.keyId = arg[0];
        this.findKeyEvent = arg[1];
        this.lockedSpeakId = arg[2];
        this.unlockSpeakId = arg[3];
        this.result = arg[4];
    }

    executeEvent(survivor, stage)
    {
        var location = globalSystem.locationManager.location;
        if (location == null)
        {
            return true;
        }

        var hasKey = location.hasFlag(this.keyId);
        if (hasKey)
        {
            var key = globalSystem.locationFlagData.getDataById(this.keyId);
            if (key == null)
            {
                return true;
            }

            survivor.speak(this.unlockSpeakId, [key.name]);

            var event = EventGenerator.generateById(this.result);
            if (event == null)
            {
                return true;
            }
            survivor.insertEvent(event, Event.executeType.event);
            if (this.parentEvent != null && this.parentEvent instanceof AccessObjectEvent)
            {
                stage.removeEvent(this.parentEvent.callObjectEvent);
            }
        }
        else
        {
            var stages = Random.shuffle(location.stages);
            var alreadyPushKey = false;
            for (var s of stages)
            {
                if (s.hasOverwriteSearchResult(this.findKeyEvent))
                {
                    alreadyPushKey = true;
                    break;
                }
            }
            if (alreadyPushKey == false)
            {
                var targetStage = stages[0];
                if (targetStage == stage)
                {
                    targetStage = stages[1];
                }
                for (var s of stages)
                {
                    if (s.visitCount == 0)
                    {
                        targetStage = s;
                        break;
                    }
                }
                targetStage.pushOverwriteSearchResult(this.findKeyEvent);
            }

            survivor.speak(this.lockedSpeakId, []);
            globalSystem.soundManager.playSe("locked00");
        }

        return true;
    }
}
