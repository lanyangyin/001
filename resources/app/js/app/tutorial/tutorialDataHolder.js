class TutorialDataHolder extends DataHolder
{
    constructor()
    {
        super("tutorialData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/tutorial/tutorialData.csv"]);
    }

    getDatasByTiming(timing)
    {
        var result = this.getDatasByWhere((data) =>
        {
            if (data.timing != timing)
            {
                return false;
            }
            if (StringExtension.isValid(data.flag))
            {
                var valid = globalSystem.flagManager.getFlagValue(data.flag);
                if (valid == false)
                {
                    return false;
                }
            }
            if (StringExtension.isValid(data.finishedScenario))
            {
                var valid = globalSystem.scenarioManager.isFinished(data.finishedScenario);
                if (valid == false)
                {
                    return false;
                }
            }
            if (StringExtension.isValid(data.requireQuestCount))
            {
                var require = Number(data.requireQuestCount);
                var valid = (globalSystem.questManager.playedQuestCount >= require);
                if (valid == false)
                {
                    return false;
                }
            }
            if (StringExtension.isValid(data.scenarioCondition))
            {
                var last = globalSystem.scenarioManager.getLastScenario();
                var next = globalSystem.scenarioManager.getNextScenario(last.date, true);
                if (next == null)
                {
                    return false;
                }
            }
            return true;
        });

        return result;
    }
}

new TutorialDataHolder();
