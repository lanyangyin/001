class GatewayFlow extends Flow
{
    constructor()
    {
        super("", true);
        this.timer = 0.5;
    }

    get fadeIn()
    {
        return false;
    }

    get fadeOut()
    {
        return true;
    }

    setupFlow()
    {
        globalSystem.survivorManager.reset();
        globalSystem.survivorManager.updateSkills();
        globalSystem.areaManager.requestArea(null);
        globalSystem.houseManager.updateOpenedItem();
    }

    updateFlow()
    {
        if (this.timer > 0)
        {
            this.timer -= globalSystem.time.deltaTime;
            return;
        }

        var date = globalSystem.scenarioManager.startDate;
        var selectDateOnly = true;
        var lastScenario = globalSystem.scenarioManager.getLastScenario();
        if (lastScenario != null)
        {
            // 前回のイベントの日付を使う
            date = lastScenario.date;
            // 次のシナリオまでの条件がなしなら、この日付のシナリオしか使わない
            var isNoWaitQuest = (lastScenario.condition == "none");
            if (isNoWaitQuest)
            {
                selectDateOnly = true;
            }
            else
            {
                selectDateOnly = false;
            }
        }

        var nextScenario = globalSystem.scenarioManager.getNextScenario(date, selectDateOnly);
        if (ScenarioExecutor.execute(nextScenario, lastScenario, "gateway"))
        {
            return;
        }

        var bootScenario = globalSystem.scenarioManager.getNextScenario(ScenarioDataHolder.anyDate, true, ScenarioManager.scenarioType.main);
        if (ScenarioExecutor.execute(bootScenario, lastScenario, "boot"))
        {
            return;
        }

        var reservedScenario = globalSystem.scenarioManager.dequeue();
        if (ScenarioExecutor.execute(reservedScenario, null, "gateway", null, globalSystem.questManager.isReplay))
        {
            return;
        }

        globalSystem.flowManager.setFlow(new StoryFlow());
        globalSystem.uiManager.menuTab.init();

        globalSystem.uiManager.question.enable();
    }

    exitFlow()
    {
    }
}
