class CallObjectSkill extends Skill
{
    constructor(data)
    {
        super(data);
    }

    update(survivor, stage)
    {
        survivor.callObject = this.data.arg;
    }
}