class StageEventOccurSkill extends Skill
{
    constructor(data)
    {
        super(data);
        this.prevStage = null;
    }

    update(survivor, stage)
    {
        if (stage == null)
        {
            return;
        }

        if (stage == this.prevStage)
        {
            return;
        }

        var event = EventGenerator.generateById(this.data.arg);
        if (event == null)
        {
            return;
        }
        event.target = survivor;
        stage.pushEvent(event);
        this.prevStage = stage;
    }
}