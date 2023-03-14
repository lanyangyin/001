class SkillDataHolder extends DataHolder
{
    constructor()
    {
        super("skillData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/skill/skillData.csv"]);
    }
}

new SkillDataHolder();