class LocationDescribeEvent extends Event
{
    constructor()
    {
        super("locationDescribe", 0, 1);

        this.spoke = false;
        this.waitTimer = 0.5;
    }

    executeEvent(survivor, stage)
    {
        if (this.spoke == false)
        {
            this.speakDescribe(survivor, stage);
            this.spoke = true;
        }

        this.waitTimer -= globalSystem.time.deltaTime;
        if (this.waitTimer > 0)
        {
            return false;
        }

        return true;
    }

    speakDescribe(survivor, stage)
    {
        var describe = stage.describe;
        if (describe == null)
        {
            return;
        }

        var data = globalSystem.locationDescribeData.getRandomByType(stage.type, describe);
        if (data == null)
        {
            return;
        }

        var id = data.id;
        var text = data.text;
        if (globalSystem.questManager.isUsedDescribe(id))
        {
            return;
        }

        survivor.describe(text, []);

        globalSystem.questManager.notifyUsedDescribe(id);
    }
}