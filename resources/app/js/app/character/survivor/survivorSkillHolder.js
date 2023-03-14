class SurvivorSkillHolder
{
    constructor(skill)
    {
        this.skills = [];

        this.pushSkill(skill);
    }

    static get SkillCountMax()
    {
        return 5;
    }

    get skillCount()
    {
        return this.skills.length;
    }

    update(survivor)
    {
        for (var skill of this.skills)
        {
            skill.update(survivor, survivor.currentStage);
        }
    }

    pushSkill(id)
    {
        if (this.skillCount >= SurvivorSkillHolder.SkillCountMax)
        {
            return;
        }

        var data = globalSystem.skillData.getDataById(id);
        if (data == null)
        {
            return;
        }

        var updater = Class.getInstance(data.type, data);
        if (updater == null)
        {
            return;
        }

        this.skills.push(updater);
    }

    removeSkill(id)
    {
        var data = this.getSkill(id);
        if (data == null)
        {
            return;
        }
        this.skills = List.remove(this.skills, data);
    }

    getSkill(id)
    {
        for (var skill of this.skills)
        {
            if (skill.data.id == id)
            {
                return skill;
            }
        }
        return null;
    }

    hasSkill(id)
    {
        var result = (this.getSkill(id) != null);
        return result;
    }
}
