class ForceQuestSuccessEvent extends QuestEndEvent
{
    constructor(args)
    {
        super("forceQuestSuccess", 0, -1);
        this.speakId = args[0];
    }

    setupEvent(survivor, stage)
    {
        if (StringExtension.isValid(this.speakId))
        {
            survivor.speak(this.speakId, []);
        }
        survivor.insertEvent(new QuestSuccessEvent(false, false), Event.executeType.event);
    }

    getUseStamina()
    {
        return 0;
    }

    getProbability(survivor, stage)
    {
        return 1;
    }
}
