class ScenarioDataHolder extends DataHolder
{
    constructor()
    {
        super("scenarioData");
    }

    static get anyDate()
    {
        return "any";
    }

    static checkCondition(scenario)
    {
        // メンバー人数条件を満たしていないなら発生しない
        var survivorCount = scenario.requireSurvivorCount;
        if (StringExtension.isValid(survivorCount) && globalSystem.survivorManager.survivors.length != Number(survivorCount))
        {
            return false;
        }
        // メンバー条件を満たしていないなら発生しない
        if (StringExtension.isValid(scenario.requireSurvivor))
        {
            var targetSurvivor = globalSystem.survivorManager.getSurvivorById(scenario.requireSurvivor);
            if (targetSurvivor == null)
            {
                return false;
            }
        }
        // フラグ条件を満たしていないなら発生しない
        if (scenario.requireFalgs.length > 0)
        {
            for (var flag of scenario.requireFalgs)
            {
                if (StringExtension.isNullOrEmpty(flag))
                {
                    continue;
                }
                var valid = globalSystem.flagManager.getFlagValue(flag);
                if (valid == false)
                {
                    return false;
                }
            }
        }

        return true;
    }

    setup()
    {
        this.setupPath([
            "resources/data/default/scenario/scenarioData.csv",
            "resources/data/default/scenario/scenarioData_event.csv",
            "resources/data/default/scenario/scenarioData_story.csv",
        ]);
    }

    onLoad()
    {
        // テーブルを統合
        this.concatDatas("id");
    }

    getNexts(finishedId, types, date, conditionIngore)
    {
        var result = this.getDatasByWhere((scenario) =>
        {
            // 終了済みシナリオなら発生しない
            if ((Type.toBoolean(scenario.once)) && finishedId.indexOf(scenario.id) >= 0)
            {
                return false;
            }
            // 必要シナリオを終了していないなら発生しない
            var requires = scenario.requireScenario;
            if (requires != null)
            {
                for (var require of requires)
                {
                    if (StringExtension.isValid(require) && finishedId.indexOf(require) == -1)
                    {
                        return false;
                    }
                }
            }
            // クローズシナリオを終了しているなら発生しない
            var close = scenario.closeScenario;
            if (StringExtension.isValid(close) && finishedId.indexOf(close) != -1)
            {
                return false;
            }
            // タイプが異なるなら発生しない
            var isValidType = false;
            for (var type of types)
            {
                if (scenario.scenarioType == type)
                {
                    isValidType = true;
                }
            }
            if (isValidType == false)
            {
                return false;
            }
            // 日付が異なるなら発生しない
            if (date != ScenarioDataHolder.anyDate)
            {
                var occurrenceDate = scenario.occurrenceDate;
                if (occurrenceDate != date)
                {
                    return false;
                }
            }

            if (conditionIngore == false)
            {
                // 条件チェック
                var condition = ScenarioDataHolder.checkCondition(scenario);
                if (condition == false)
                {
                    return false;
                }

                // シナリオ発生確率
                var occurRatio = Number(scenario.occurRatio);
                var ratio = Random.range(100) / 100.0;
                if (ratio > occurRatio)
                {
                    return false;
                }
            }

            return true;
        });

        return result;
    }

    getUpstreams(scenario)
    {
        var result = [];
        var found = false;
        var length = this.getLength(0);
        for (var i = length - 1; i >= 0; i--)
        {
            var data = this.getDataByIndex(0, i);
            if (found)
            {
                if (data.condition == "none" && data.scenarioType == scenario.scenarioType && data.date == scenario.date)
                {
                    result.unshift(data);
                }
                else
                {
                    break;
                }
            }
            else
            {
                if (data.id == scenario.id)
                {
                    result.unshift(data);
                    found = true;
                }
            }
        }

        return result;
    }

    getDatesByType(type)
    {
        var result = [];
        var length = this.getLength(0);
        for (var i = 0; i < length; i++)
        {
            var data = this.getDataByIndex(0, i);
            if (data.scenarioType != type)
            {
                continue;
            }
            if (StringExtension.isNullOrEmpty(data.openDate))
            {
                continue;
            }
            result.push(data.openDate);
        }
        return result;
    }
}

new ScenarioDataHolder();
