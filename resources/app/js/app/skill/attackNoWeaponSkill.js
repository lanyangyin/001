class AttackNoWeaponSkill extends Skill
{
    constructor(data)
    {
        super(data);
    }

    update(survivor, stage)
    {
        if (survivor.weapon == null)
        {
            survivor.atkRatio = Number(this.data.arg);
        }
        else
        {
            survivor.atkRatio = 1;
        }
    }
}
