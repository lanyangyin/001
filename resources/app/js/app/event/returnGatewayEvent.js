class ReturnGatewayEvent extends Event
{
    constructor(speak = false, completeQuest = false)
    {
        super("returnGateway", 3, -1);

        this.speak = speak;
        this.completeQuest = completeQuest;
        this.executed = false;
    }

    setupEvent(survivor, stage)
    {
        globalSystem.areaManager.finishArea();

        if (this.speak)
        {
            survivor.speak(this.type, []);
        }
    }

    executeEvent(survivor, stage)
    {
        if (this.executed)
        {
            return false;
        }

        this.executed = true;

        var isBusy = globalSystem.uiManager.textLine[survivor.index].isBusy;
        if (isBusy)
        {
            return false;
        }

        var quest = globalSystem.questManager.currentQuest;
        var scenario = globalSystem.questManager.currentScenario;

        // 日付情報
        var date = -1;
        if (quest != null)
        {
            date = quest.date;
        }

        // シナリオ中だったかどうか
        var hasScenario = (scenario != null);

        // クエスト完了通知
        globalSystem.questManager.endQuest(this.completeQuest);

        // 待機中のシナリオがないなら、次のシナリオを実行してみる
        if (hasScenario == false)
        {
            var random = Random.range(100) / 100.0;
            var ratio = parseFloat(quest.scenarioOccurRatio);
            if (random < ratio)
            {
                // シナリオ実行に成功したら、ここで終了
                var selectDateOnly = Type.toBoolean(quest.scenarioCurrentDateOnly);
                var next = globalSystem.scenarioManager.getNextScenario(date, selectDateOnly);
                if (next != null)
                {
                    var last = globalSystem.scenarioManager.getLastScenario(next.date);
                    if (ScenarioExecutor.execute(next, last, "questComplete"))
                    {
                        return false;
                    }
                }
            }
        }

        globalSystem.flowManager.setFlow(new GatewayFlow());
        return false;
    }

    isContinuable()
    {
        return true;
    }
}