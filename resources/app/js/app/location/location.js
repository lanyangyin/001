class Location
{
    constructor(data)
    {
        this.data = data;
        this.id = data.id;
        this.name = data.name;
        this.image = data.image;
        this.describe = data.describe;
        this.sound = data.sound;
        this.outside = data.outside;
        this.stageCount = data.stageCount;
        this.lockedKey = null;
        this.stages = [];
        this.options = [];
        this.usedDescribe = [];
        this.flags = [];
    }

    static getDescription(location)
    {
        var name = location.name;

        var depth = Terminology.get("location_depth");
        if (location.stageCount <= GlobalParam.get("locationDepthNarrow"))
        {
            depth = depth.replace("{0}", Terminology.get("location_depthNarrow"));
        }
        else if (location.stageCount <= GlobalParam.get("locationDepthMiddle"))
        {
            depth = depth.replace("{0}", Terminology.get("location_depthMiddle"));
        }
        else if (location.stageCount <= GlobalParam.get("locationDepthWide"))
        {
            depth = depth.replace("{0}", Terminology.get("location_depthWide"));
        }
        else
        {
            depth = depth.replace("{0}", Terminology.get("location_depthWide"));
        }

        var enemyLevel = Terminology.get("location_enemyLevel");
        if (location.enemyLevel <= GlobalParam.get("locationEnemyLevelLow"))
        {
            enemyLevel = enemyLevel.replace("{0}", Terminology.get("location_enemyLevelLow"));
        }
        else if (location.enemyLevel <= GlobalParam.get("locationEnemyLevelMiddle"))
        {
            enemyLevel = enemyLevel.replace("{0}", Terminology.get("location_enemyLevelMiddle"));
        }
        else if (location.enemyLevel <= GlobalParam.get("locationEnemyLevelHigh"))
        {
            enemyLevel = enemyLevel.replace("{0}", Terminology.get("location_enemyLevelHigh"));
        }
        else if (location.enemyLevel <= GlobalParam.get("locationEnemyLevelVeryHigh"))
        {
            enemyLevel = enemyLevel.replace("{0}", Terminology.get("location_enemyLevelVeryHigh"));
        }
        else
        {
            enemyLevel = enemyLevel.replace("{0}", Terminology.get("location_enemyLevelVeryHigh"));
        }

        var prioritizeItem = Terminology.get("location_prioritizeItem");
        var item = globalSystem.itemData.getDataById(location.prioritizeItem);
        if (item != null)
        {
            prioritizeItem = prioritizeItem.replace("{0}", item.name);
        }
        else
        {
            prioritizeItem = prioritizeItem.replace("{0}", Terminology.get("location_prioritizeItemNone"));
        }

        var result = `${name}<br><br>${depth}<br>${enemyLevel}<br>${prioritizeItem}`;
        return result;
    }

    update()
    {
        for (var option of this.options)
        {
            option.execute(this);
        }
    }

    reset()
    {
        this.resetFlags();
    }

    onGenerated(data)
    {
        if (StringExtension.isValid(data.option))
        {
            var option = Class.getInstance(data.option, data.optionArgs);
            if (option != null)
            {
                this.pushOption(option);
            }
        }
    }

    getStage(id)
    {
        for (var stage of this.stages)
        {
            if (stage.id == id)
            {
                return stage;
            }
        }

        return null;
    }

    pushOption(option)
    {
        this.options.push(option);
        option.setup(this);
    }

    onVisitStage(stage)
    {
        for (var option of this.options)
        {
            option.onVisitStage(this, stage);
        }
    }

    isUsedDescribe(id)
    {
        for (var used of this.usedDescribe)
        {
            if (used == id)
            {
                return true;
            }
        }
        return false;
    }

    notifyUsedDescribe(id)
    {
        if (id == null)
        {
            return;
        }
        this.usedDescribe.push(id);
    }

    setFlag(flag)
    {
        this.flags.push(flag);
    }

    getFlags()
    {
        var result = this.flags;
        return result;
    }

    resetFlags()
    {
        this.flags = [];
    }

    removeFlag(flag)
    {
        this.flags = List.remove(this.flags, flag);
    }

    hasFlag(flag)
    {
        var result = (this.flags.indexOf(flag) != -1);
        return result;
    }

    getFlagInfo()
    {
        var result = [];
        for (var flag of this.flags)
        {
            var data = globalSystem.locationFlagData.getDataById(flag);
            if (data == null)
            {
                continue;
            }
            var isAlready = false;
            for (var already of result)
            {
                if (already.id == data.id)
                {
                    already.count++;
                    isAlready = true;
                    break;
                }
            }
            if (isAlready)
            {
                continue;
            }

            var info = { id: flag, count: 1, data: data };
            result.push(info);
        }
        return result;
    }
}
