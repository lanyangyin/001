class QuestExecutor
{
    static setup(quest, scenario, area = null, location = null)
    {
        // エリア設定
        if (area == null)
        {
            area = quest.area;
        }
        globalSystem.areaManager.requestArea(area, location);

        // ロケーション生成
        QuestExecutor.generateLocation(quest);

        // 開始イベントの一時登録リスト
        var startEvents = [globalSystem.survivorManager.survivors.length];
        for (var i = 0; i < globalSystem.survivorManager.survivors.length; i++)
        {
            startEvents[i] = [];
        }

        // シナリオ割り込み
        var scenarioStart = false;
        if (scenario != null)
        {
            if (StringExtension.isValid(scenario.eventType))
            {
                var scenarioEvent = EventGenerator.generate(scenario.eventType, [scenario.eventArg0], QuestExecutor.onEndScenario);
                startEvents[0].push(scenarioEvent);
                scenarioStart = true;
            }
        }

        // シナリオから開始でないなら、通常のクエスト開始イベントを登録
        if (scenarioStart == false)
        {
            for (var i = 0; i < globalSystem.survivorManager.survivors.length; i++)
            {
                // 生存しているsurvivorが開始speakする
                var survivor = globalSystem.survivorManager.survivors[i];
                var isMain = (survivor == globalSystem.survivorManager.validSurvivor);
                var speakId = quest.startSpeak;
                startEvents[i].push(new QuestStartEvent(isMain, speakId));
            }
        }

        // 開始時イベントを登録
        for (var i = 0; i < globalSystem.survivorManager.survivors.length; i++)
        {
            var survivor = globalSystem.survivorManager.survivors[i];
            survivor.reset();
            if (survivor.isValid)
            {
                for (var event of startEvents[i])
                {
                    survivor.pushEvent(event, Event.executeType.event);
                }
            }
        }
    }

    static generateLocation(quest)
    {
        var id = globalSystem.areaManager.getCurrentLocation();
        var locationData = globalSystem.locationData.getDataById(id);
        var location = LocationGenerator.generate(locationData);
        globalSystem.locationManager.setLocation(location);

        if (StringExtension.isValid(quest.locationOption))
        {
            var option = Class.getInstance(quest.locationOption, quest.locationOptionArgs);
            if (option != null)
            {
                location.pushOption(option);
            }
        }

        var lastScenario = globalSystem.scenarioManager.getLastScenario(quest.date);
        if (lastScenario != null)
        {
            location = ScenarioExecutor.applyAreaLocation(lastScenario, location);
            globalSystem.locationManager.setLocation(location);
        }

        if (EndlessSystem.isEndless(quest))
        {
            location = globalSystem.endlessManager.applyAreaLocation(location);
            globalSystem.locationManager.setLocation(location);
        }
    }

    static checkSuccess(quest)
    {
        switch (quest.success)
        {
            case "goOutside":
                {
                    return false;
                }
            case "visitAllStage":
                {
                    var location = globalSystem.locationManager.location;
                    if (location == null)
                    {
                        return false;
                    }
                    for (var stage of location.stages)
                    {
                        if (stage.visitCount <= 0)
                        {
                            return false;
                        }
                    }
                    return true;
                }
            default:
                {
                    return false;
                }
        }
    }

    static checkFailed(quest)
    {
        switch (quest.failed)
        {
            case "dead":
                for (var survivor of globalSystem.survivorManager.survivors)
                {
                    if (survivor.isDead)
                    {
                        return true;
                    }
                }
                return false;
            default:
                return false;
        }
    }

    static success(speak)
    {
        var survivor = globalSystem.survivorManager.validSurvivor;
        if (survivor != null)
        {
            survivor.pushEvent(new QuestSuccessEvent(speak), Event.executeType.quest);
        }
    }

    static failed(speak)
    {
        for (var survivor of globalSystem.survivorManager.survivors)
        {
            survivor.resetEvents();
        }
        var flow = globalSystem.questManager.questFailedFlow;
        globalSystem.questManager.endQuest(false);
        globalSystem.uiManager.fade.speed = 1.0;
        globalSystem.flowManager.setFlow(flow);
    }

    static onEndScenario()
    {
        globalSystem.questManager.scenarioExecuted = true;
        globalSystem.scenarioManager.finish(globalSystem.questManager.currentScenario);
    }
}