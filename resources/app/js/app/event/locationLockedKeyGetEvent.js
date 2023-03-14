class LocationLockedKeyGetEvent extends Event
{
    constructor(args)
    {
        super("locationLockedKeyGet", 0, 1);
        this.speakId = args[0];
    }

    executeEvent(survivor, stage)
    {
        var location = globalSystem.locationManager.location;
        if (location == null)
        {
            return true;
        }

        var key = location.lockedKey;
        if (StringExtension.isNullOrEmpty(key))
        {
            return true;
        }

        var keyData = globalSystem.locationFlagData.getDataById(key);
        if (keyData == null)
        {
            return true;
        }

        location.setFlag(key);

        survivor.speak(this.speakId, [keyData.name]);
        SurvivorCallHandler.registerHas(keyData.name);
        return true;
    }

    getUseStamina()
    {
        return 0;
    }
}