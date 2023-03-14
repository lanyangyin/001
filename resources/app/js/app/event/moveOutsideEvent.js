class MoveOutsideEvent extends Event
{
    constructor()
    {
        super("moveOutside", 0, -1);

        this.unlocked = false;
        this.broken = false;
    }

    get isLocked()
    {
        if (this.unlocked)
        {
            return false;
        }

        var location = globalSystem.locationManager.location;
        if (location == null)
        {
            return false;
        }

        var result = (location.lockedKey != null);
        return result;
    }

    executeEvent(survivor, stage)
    {
        var location = globalSystem.locationManager.location;
        var outside = location.outside;
        survivor.speak("pre_move", [outside]);

        if (this.broken)
        {
            survivor.speak("brokenOutside", [outside]);
            survivor.pushEvent(new MoveEvent([0, true]), Event.executeType.event);
            return true;
        }

        if (location.lockedKey != null)
        {
            var keyData = globalSystem.locationFlagData.getDataById(location.lockedKey);
            if (keyData != null)
            {
                var name = null;
                var hasKey = false;
                if (location.hasFlag(location.lockedKey))
                {
                    hasKey = true;
                    name = keyData.name;
                }
                else
                {
                    var tools = survivor.getItemsByType("tool");
                    for (var tool of tools)
                    {
                        if (tool.arg0 == keyData.subArg)
                        {
                            hasKey = true;
                            name = tool.name;
                            break;
                        }
                    }
                }

                if (hasKey)
                {
                    if (this.unlocked == false)
                    {
                        if (StringExtension.isValid(keyData.speakId[1]))
                        {
                            survivor.speak(keyData.speakId[1], [name]);
                        }
                        this.unlocked = true;
                    }
                }
                else
                {
                    if (StringExtension.isValid(keyData.speakId[0]))
                    {
                        survivor.speak(keyData.speakId[0], [outside]);
                    }
                    survivor.pushEvent(new MoveEvent([0, true]), Event.executeType.event);
                    return true;
                }
            }
        }

        globalSystem.questManager.success();
        return true;
    }

    exitEvent(survivor, stage)
    {
        if (this.unlocked)
        {
            var location = globalSystem.locationManager.location;
            if (location != null && location.lockedKey != null)
            {
                location.removeFlag(location.lockedKey);
            }
        }
    }

    getCallWords(survivor, stage)
    {
        var location = globalSystem.locationManager.location;
        var outside = location.outside;
        return [outside, "go"];
    }

    getProbability()
    {
        return 0;
    }

    isContinuable()
    {
        return true;
    }
}
