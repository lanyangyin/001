class DefenseSkill extends Skill
{
    constructor(data)
    {
        super(data);
    }

    update(survivor, stage)
    {
        survivor.defRatio = Number(this.data.arg);
    }
}
