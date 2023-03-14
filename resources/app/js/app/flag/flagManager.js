class FlagManager extends GlobalManager
{
    constructor()
    {
        super("flagManager");
        this.flags = [];
    }

    check(timing)
    {
        var list = globalSystem.flagData.getDatasByTiming(timing);
        if (list.length == 0)
        {
            return;
        }

        for (var data of list)
        {
            var valid = this.checkFlag(data);
            if (valid)
            {
                this.enableFalg(data.id);
            }
        }
    }

    checkFlag(data)
    {
        var result = false;

        switch (data.condition)
        {
            case "finishedScenario":
                {
                    var scenario = data.args[0];
                    result = globalSystem.scenarioManager.isFinished(scenario);
                }
                break;
            case "allCharacterScenarioFinished":
                {
                    var dates = globalSystem.scenarioData.getDatesByType(ScenarioManager.scenarioType.character);
                    var closedDates = 0;
                    for (var date of dates)
                    {
                        if (globalSystem.scenarioManager.isClosed(date))
                        {
                            closedDates++;
                        }
                    }
                    result = (dates.length == closedDates);
                }
                break;
            default:
                break;
        }

        return result;
    }

    enableFalg(id)
    {
        var data = globalSystem.flagData.getDataById(id);
        if (data == null)
        {
            return;
        }

        var value = this.getEnabledValue(data);
        this.setFlagValue(id, value);
    }

    getEnabledValue(data)
    {
        switch (data.type)
        {
            case "bool":
                return true;
            default:
                return null;
        }
    }

    setFlagValue(id, value)
    {
        for (var data of this.flags)
        {
            if (data.id == id)
            {
                data.value = value;
                return;
            }
        }

        var newData = { id: id, value: value };
        this.flags.push(newData);
    }

    getFlagValue(id)
    {
        var flag = globalSystem.flagData.getDataById(id);
        if (flag == null)
        {
            return false;
        }

        if (flag.timing == "immediate")
        {
            var valid = this.checkFlag(flag);
            if (valid)
            {
                var result = this.getEnabledValue(flag);
                return result;
            }
            else
            {
                return false;
            }
        }
        else
        {
            for (var data of this.flags)
            {
                if (data.id == id)
                {
                    return data.value;
                }
            }
            return false;
        }
    }
}

new FlagManager();
