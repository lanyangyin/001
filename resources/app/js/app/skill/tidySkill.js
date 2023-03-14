class TidySkill extends Skill
{
    constructor(data)
    {
        super(data);
    }

    update(survivor, stage)
    {
        survivor.inventory.additionalCount = Number(this.data.arg);
    }
}
