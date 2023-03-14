class FishingEvent extends Event
{
    constructor(args)
    {
        super("fishing", 2, 1);

        this.item = null;
        this.sound = "water00";
        this.speakId = args[0];
        this.itemId = args[1];
        this.ratio = Number(args[2]);
    }

    setupEvent(survivor, stage)
    {
        this.item = globalSystem.itemData.getDataById(this.itemId);

        survivor.speak("fishingStart", []);

        globalSystem.cameraManager.focusSurvivor(survivor);
    }

    executeEvent(survivor, stage)
    {
        if (this.item == null)
        {
            survivor.speak("fishingFailed", []);
            return true;
        }

        var ratio = Random.range(100) / 100.0;
        if (ratio > this.ratio)
        {
            survivor.speak("fishingFailed", []);
            return true;
        }

        var pushed = survivor.pushItem(this.item);
        if (pushed)
        {
            survivor.speak(this.speakId, [this.item.name]);
            survivor.inventory.pushTemporary(this.item);
        }
        else
        {
            survivor.speak("fishingFailed", []);
        }

        return true;
    }

    exitEvent(survivor, stage)
    {
        globalSystem.cameraManager.focusReset();
    }
}
