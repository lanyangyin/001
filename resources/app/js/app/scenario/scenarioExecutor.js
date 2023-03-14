class ScenarioExecutor
{
    static execute(scenario, lastScenario, timing, area = null, isReplay = false)
    {
        if (scenario == null)
        {
            return false;
        }

        if (scenario.timings.indexOf(timing) == -1)
        {
            return false;
        }

        return ScenarioExecutor.executeScenario(scenario, lastScenario, area, isReplay);
    }

    static executeScenario(scenario, lastScenario, area, isReplay)
    {
        var quest = globalSystem.questData.getDataById(scenario.questId);
        if (quest == null)
        {
            return false;
        }

        if (area == null)
        {
            globalSystem.survivorManager.reset();
        }

        globalSystem.questManager.setupQuest(quest, scenario, area, null, isReplay);
        switch (scenario.type)
        {
            case "quest":
                globalSystem.flowManager.setFlow(new QuestFlow());
                break;
            case "logue":
                globalSystem.flowManager.setFlow(new LogueFlow());
                break;
        }

        ScenarioExecutor.beforeExecute(scenario, lastScenario);

        return true;
    }

    static applyAreaLocation(scenario, location)
    {
        var hasNext = ScenarioExecutor.hasNextScenario(scenario, false);
        var memoryItems = ScenarioExecutor.getMemoryItems(scenario);
        if (hasNext && memoryItems.length > 0)
        {
            // search結果上書きを登録
            for (var stage of location.stages)
            {
                if (stage == null)
                {
                    continue;
                }
                // 出現確率
                var isExist = GlobalParam.get("stageMemoryItemRatio");
                if (isExist == false)
                {
                    continue;
                }
                var nullCount = Random.range(GlobalParam.get("stageMemoryItemDummyCount"));
                for (var i = 0; i < nullCount; i++)
                {
                    // 「必ず1回目のSearchEventで見つかる」を防ぐため、nullを入れてランダムにする
                    stage.pushOverwriteSearchResult(null);
                }
                stage.pushOverwriteSearchResult("itemGetMemory00");
            }
        }

        switch (scenario.condition)
        {
            case "visitLocation":
                {
                    if (hasNext)
                    {
                        var locationId = scenario.conditionArgs[0];
                        var index = parseInt(scenario.conditionArgs[1]) - 1;
                        globalSystem.areaManager.pushOverwriteLocation(index, locationId);
                    }
                }
                break;
            case "questTimeLimit":
                {
                    var timeLimit = ScenarioExecutor.getConditionResult(scenario);
                    if (timeLimit.count <= 0)
                    {
                        for (var stage of location.stages)
                        {
                            if (stage == null)
                            {
                                continue;
                            }
                            var notFoundCount = Random.range(3);
                            for (var i = 0; i < notFoundCount; i++)
                            {
                                stage.pushOverwriteSearchResult("itemNotFound00");
                            }
                            var battleCount = Random.range(3);
                            for (var i = 0; i < battleCount; i++)
                            {
                                var battle = EventGenerator.generateById("battle00");
                                stage.pushEvent(battle);
                            }
                        }
                    }
                }
                break;
            default:
                break;
        }

        return location;
    }

    static beforeExecute(scenario, lastScenario)
    {
        if (lastScenario != null)
        {
            // 探索回数のクリア
            globalSystem.questManager.clearQuestCount();
            globalSystem.questManager.clearVisitedLocaton(scenario.date);

            // 条件ごとの消費処理
            switch (lastScenario.condition)
            {
                case "memoryItem":
                    {
                        var date = scenario.date;
                        var count = Number(lastScenario.conditionArgs[0]);
                        var list = ScenarioExecutor.getNextMemoryItems(date, count);
                        for (var data of list)
                        {
                            if (data.item != null && data.owner != null)
                            {
                                data.owner.removeItem(data.item);
                            }
                        }
                    }
                    break;
                default:
                    break;
            }
        }

        globalSystem.textAutoManager.onExecuteScenario(scenario);
    }

    static checkCondition(scenario)
    {
        var conditionResult = this.getConditionResult(scenario);
        if (conditionResult.condition <= 0)
        {
            return true;
        }
        var ratio = conditionResult.count / conditionResult.condition;
        var result = ratio >= 1;
        return result;
    }

    static getConditionResult(scenario)
    {
        var result = { condition: 1, count: 0, descriptions: [] };

        switch (scenario.condition)
        {
            case "none":
                {
                    result.condition = 1;
                    result.count = 1;
                    result.descriptions.push("????");
                }
                break;
            case "noCondition":
                {
                    result.condition = 1;
                    result.count = 1;
                    result.descriptions.push(StringExtension.empty);
                }
                break;
            case "questCount":
                {
                    result.condition = Number(scenario.conditionArgs[0]);
                    result.count = Number(globalSystem.questManager.playedQuestCount);
                    result.descriptions.push(result.condition);
                }
                break;
            case "questProgress":
                {
                    result.condition = Number(scenario.conditionArgs[0]);
                    result.count = Number(globalSystem.questManager.playedQuestProgressMax);
                    result.descriptions.push(result.condition);
                }
                break;
            case "visitLocation":
                {
                    result.condition = 1;
                    result.count = 0;
                    var location = scenario.conditionArgs[0];
                    var date = scenario.date;
                    if (StringExtension.isValid(scenario.openDate))
                    {
                        date = scenario.openDate;
                    }
                    if (globalSystem.questManager.isVisitedLocaton(date, location))
                    {
                        result.count = 1;
                    }
                    var locationData = globalSystem.locationData.getDataById(location);
                    if (locationData != null)
                    {
                        result.descriptions.push(locationData.name);
                    }
                }
                break;
            case "memoryItem":
                {
                    var date = scenario.date;
                    if (StringExtension.isValid(scenario.openDate))
                    {
                        date = scenario.openDate;
                    }
                    var survivorItems = globalSystem.survivorManager.getItemsByKey("type", "memory");
                    var houseItems = globalSystem.houseManager.getItemsByKey("type", "memory");
                    var items = survivorItems.concat(houseItems);
                    var memoryItems = [];
                    for (var item of items)
                    {
                        if (StringExtension.isNullOrEmpty(item.arg0) || item.arg0 == date)
                        {
                            memoryItems.push(item);
                        }
                    }
                    var dateData = globalSystem.exprolerData.getDataByDate(date);
                    result.condition = Number(scenario.conditionArgs[0]);
                    result.count = memoryItems.length;

                    var correctItems = globalSystem.itemData.getDatasByWhere((item) =>
                    {
                        if (item.type != "memory")
                        {
                            return false;
                        }
                        if (item.arg0 != date)
                        {
                            return false;
                        }
                        return true;
                    });
                    var names = "";
                    for (var i = 0; i < correctItems.length; i++)
                    {
                        names += `<red>${correctItems[i].name}</red>`;
                        if (i < correctItems.length - 1)
                        {
                            names += " / ";
                        }
                    }
                    result.descriptions.push(dateData.name);
                    result.descriptions.push(result.condition);
                    result.descriptions.push(names);
                }
                break;
            case "deleteWorld":
                {
                    result.condition = 1;
                    result.count = 1;
                }
                break;
            case "reboot":
                {
                    result.condition = 1;
                    result.count = 1;
                }
                break;
            case "questTimeLimit":
                {
                    var limit = Number(scenario.conditionArgs[0]);
                    var times = globalSystem.questManager.playedQuestTimes;
                    result.condition = 0;
                    result.count = limit - times;
                    result.descriptions.push(limit);
                }
                break;
            default:
                break;
        }

        return result;
    }

    static getScenarioTarget(scenario)
    {
        var result = { hasNext: false, target: "", condition: "", description: "" };
        if (scenario == null)
        {
            return result;
        }

        if (StringExtension.isNullOrEmpty(scenario.storyTarget))
        {
            return result;
        }

        // 次に発生するシナリオがあるか
        var hasNext = ScenarioExecutor.hasNextScenario(scenario, false);
        // 条件を考慮しないなら次に発生するシナリオがあるか
        var hasNextConditionIngore = ScenarioExecutor.hasNextScenario(scenario, true);
        // 最後のシナリオ
        var last = globalSystem.scenarioManager.getLastScenario();

        if (hasNext || (Type.toBoolean(scenario.hasNext) == false && last == scenario) || scenario.scenarioType == "baseCamp")
        {
            var target = `${Terminology.get("story_target")}${scenario.storyTarget}　<br>`;
            var condition = Terminology.get(`story_target_${scenario.condition}`);
            var description = Terminology.get(`story_targetDescription_${scenario.condition}`);

            var conditionResult = ScenarioExecutor.getConditionResult(scenario);
            if (conditionResult != null)
            {
                var count = conditionResult.count;
                if (count < 0)
                {
                    count = 0;
                }

                condition = condition.replace("{0}", conditionResult.descriptions[0]);
                if (conditionResult.condition > 0)
                {
                    condition = condition.replace("{1}", `${count}/${conditionResult.condition}`);
                }
                else
                {
                    condition = condition.replace("{1}", `${count}`);
                }
                for (var i = 0; i < conditionResult.descriptions.length; i++)
                {
                    description = description.replace(`{${i}}`, conditionResult.descriptions[i]);
                }
            }

            result.hasNext = true;
            result.target = target + condition;
            result.condition = condition;
            result.description = description;
        }
        else if (hasNextConditionIngore)
        {
            result.hasNext = true;
            result.target = Terminology.get("story_target_invalid");
            result.condition = "";
            result.description = Terminology.get("story_targetDescription_invalid");
        }

        return result;
    }

    static getScenarioOutline(scenario)
    {
        var result = Tag.replace(scenario.storyOutline);
        switch (scenario.scenarioType)
        {
            case "baseCamp":
                {
                    result = result.replace("{0}", globalSystem.endlessManager.baseCampCount);

                    var location = globalSystem.locationData.getDataById(globalSystem.endlessManager.nextDestination);
                    if (location != null)
                    {
                        var nextDestination = Terminology.get("story_outline_nextDestination");
                        nextDestination = nextDestination.replace("{0}", globalSystem.endlessManager.nextDestinationCount);
                        nextDestination = nextDestination.replace("{1}", location.name);
                        result += nextDestination;
                    }
                }
                break;
            default:
                break;
        }

        return result;
    }

    static hasNextScenario(scenario, conditionIngore)
    {
        var result = false;

        // 「同じ日付」または「今回オープンした日付」で、次に発生するシナリオを取得
        var nextScenarios = globalSystem.scenarioManager.getNexts(scenario.date, conditionIngore);
        if (StringExtension.isValid(scenario.openDate))
        {
            var openScenarios = globalSystem.scenarioManager.getNexts(scenario.openDate, conditionIngore);
            nextScenarios = nextScenarios.concat(openScenarios);
        }

        // 次に発生するシナリオがあるか
        for (var next of nextScenarios)
        {
            if (next == null)
            {
                continue;
            }
            if (next.requireScenario == null)
            {
                continue;
            }
            for (var require of next.requireScenario)
            {
                if (require == scenario.id)
                {
                    result = true;
                    break;
                }
            }
        }

        return result;
    }

    static getNextMemoryItems(date, count)
    {
        var result = [];
        for (var i = 0; i < count; i++)
        {
            var targetItem = null;
            var targetOwner = null;
            var survivorItems = globalSystem.survivorManager.getItemsByKey("type", "memory");
            var houseItems = globalSystem.houseManager.getItemsByKey("type", "memory");
            // 先にどのEPでも使えるアイテムを探す
            for (var item of survivorItems)
            {
                if (StringExtension.isNullOrEmpty(item.arg0))
                {
                    targetItem = item;
                    targetOwner = globalSystem.survivorManager;
                    break;
                }
            }
            for (var item of houseItems)
            {
                if (StringExtension.isNullOrEmpty(item.arg0))
                {
                    targetItem = item;
                    targetOwner = globalSystem.houseManager;
                    break;
                }
            }
            // あとでEP専用アイテムを探す。EP専用アイテムの方を優先して使うため
            for (var item of survivorItems)
            {
                if (item.arg0 == date)
                {
                    targetItem = item;
                    targetOwner = globalSystem.survivorManager;
                    break;
                }
            }
            for (var item of houseItems)
            {
                if (item.arg0 == date)
                {
                    targetItem = item;
                    targetOwner = globalSystem.houseManager;
                    break;
                }
            }
            if (targetItem == null)
            {
                continue;
            }

            var data = { item: targetItem, owner: targetOwner };
            result.push(data);
        }

        return result;
    }

    static getMemoryItems(scenario)
    {
        var result = [];
        var date = scenario.date;
        var memoryItems = globalSystem.itemData.getDatasByKey("type", "memory");
        for (var item of memoryItems)
        {
            if (item.arg0 == date)
            {
                result.push(item);
            }
        }
        return result;
    }
}
