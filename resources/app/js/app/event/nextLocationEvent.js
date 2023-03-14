class NextLocationEvent extends Event
{
    constructor(quest, scenario, speak = false, repeatEvent = false)
    {
        super("nextLocation", 0, -1);

        this.quest = quest;
        this.scenario = scenario;
        this.speak = speak;
        this.repeatEvent = repeatEvent;
    }

    setupEvent(survivor, stage)
    {
        if (this.speak)
        {
            survivor.speak(this.type, []);
        }
    }

    executeEvent(survivor, stage)
    {
        return true;
    }

    exitEvent(survivor, stage)
    {
        if (this.repeatEvent)
        {
            var isOccur = GlobalParam.get("repeatEventOccurRatio");
            if (isOccur)
            {
                // シナリオ実行に成功したら、ここで終了
                var next = globalSystem.scenarioManager.getRepeatScenario(this.quest.date);
                if (next != null)
                {
                    next.prevQuest = this.quest;
                    next.prevScenario = this.scenario;

                    var area = this.quest.area;
                    if (ScenarioExecutor.execute(next, null, "questInterval", area))
                    {
                        return;
                    }
                }
            }
        }

        globalSystem.questManager.setupQuest(this.quest, this.scenario);
        globalSystem.flowManager.setFlow(new QuestFlow());
        //globalSystem.soundManager.pauseBgm();
    }

    isUseSurvivorSpeed()
    {
        return false;
    }

    getUseStamina()
    {
        return 0;
    }
}
