class EndingEvent extends Event
{
    constructor(id)
    {
        super("ending", 0, -1);
        this.executed = false;

        this.endingId = id;
    }

    executeEvent(survivor, stage)
    {
        if (this.executed)
        {
            return false;
        }

        this.executed = true;

        // クエスト完了通知
        globalSystem.questManager.endQuest(false);

        // エンディングへ
        globalSystem.flowManager.setFlow(new EndingFlow(this.endingId));
        return false;
    }

    isSkipTimer()
    {
        return true;
    }

    isUseSurvivorSpeed()
    {
        return false;
    }
}