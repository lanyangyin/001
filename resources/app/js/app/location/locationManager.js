class LocationManager extends GlobalManager
{
    constructor()
    {
        super("locationManager");
        this.location = null;
    }

    update()
    {
        if (this.location != null)
        {
            this.location.update();
        }
    }

    reset()
    {
        if (this.location != null)
        {
            this.location.reset();
        }
    }

    setLocation(location)
    {
        if (location == null)
        {
            this.location = null;
            return;
        }

        if (this.location != null && this.location != location)
        {
            var flags = this.location.getFlags();
            for (var flag of flags)
            {
                var data = globalSystem.locationFlagData.getDataById(flag);
                if (data == null)
                {
                    continue;
                }
                if (Type.toBoolean(data.continuation))
                {
                    location.setFlag(flag);
                }
            }
        }

        this.location = location;
    }

    getStage(id)
    {
        if (this.location == null)
        {
            return;
        }
        return this.location.getStage(id);
    }
}

new LocationManager();
