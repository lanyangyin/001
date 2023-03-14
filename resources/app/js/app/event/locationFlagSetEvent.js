class LocationFlagSetEvent extends Event
{
    constructor(args)
    {
        super("locationFlagSet", 0, 1);

        this.flagId = args[0];
        this.speakId = args[1];
    }

    executeEvent(survivor, stage)
    {
        var location = globalSystem.locationManager.location;
        if (location == null)
        {
            return true;
        }

        var flag = globalSystem.locationFlagData.getDataById(this.flagId);
        if (flag == null)
        {
            return true;
        }

        location.setFlag(this.flagId);

        if (StringExtension.isValid(this.speakId))
        {
            survivor.speak(this.speakId, [flag.name]);
            SurvivorCallHandler.registerHas(flag.name);
        }
        return true;
    }

    getUseStamina()
    {
        return 0;
    }
}