class AutoPlayExecutor
{
    static eventId = -1;

    static currentFlow = null;

    static get enabled()
    {
        var result = AutoPlayExecutor.eventId != -1;
        return result;
    }

    static switch()
    {
        if (AutoPlayExecutor.enabled)
        {
            AutoPlayExecutor.end();
        }
        else
        {
            AutoPlayExecutor.begin();
        }
    }

    static begin()
    {
        if (AutoPlayExecutor.enabled)
        {
            return;
        }
        AutoPlayExecutor.eventId = setInterval(AutoPlayExecutor.update, 100);
    }

    static end()
    {
        if (AutoPlayExecutor.enabled == false)
        {
            return;
        }
        clearInterval(AutoPlayExecutor.eventId);
        AutoPlayExecutor.eventId = -1;
    }

    static update()
    {
        if (AutoPlayResident.update())
        {
            return;
        }

        var flow = globalSystem.flowManager.currentFlow;
        if (flow == null)
        {
            return;
        }

        switch (flow.constructor)
        {
            case StoryFlow:
                {
                    AutoPlayStory.update();
                }
                break;
            case ExprolerFlow:
                {
                    AutoPlayExproler.update();
                }
                break;
            case QuestFlow:
                {
                    AutoPlayQuest.update();
                }
                break;
            case LogueFlow:
                {
                    AutoPlayQuest.update();
                }
                break;
            case EndingFlow:
                {
                    AutoPlayEnding.update();
                }
                break;
            case GameOverFlow:
                {
                    AutoPlayGameOver.update();
                }
                break;
            default:
                break;
        }
    }
}