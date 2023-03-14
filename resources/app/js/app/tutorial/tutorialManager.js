class TutorialManager extends GlobalManager
{
    constructor()
    {
        super("tutorialManager");
        this.finishedIds = [];
    }

    check(timing)
    {
        var list = globalSystem.tutorialData.getDatasByTiming(timing);
        if (list.length == 0)
        {
            return false;
        }

        var tutorial = null;
        for (var data of list)
        {
            if (this.finishedIds.indexOf(data.id) != -1)
            {
                continue;
            }
            tutorial = data;
            break;
        }

        if (tutorial == null)
        {
            return false;
        }

        this.open(tutorial, timing);
        return true;
    }

    open(tutorial, timing)
    {
        if (tutorial == null)
        {
            return;
        }

        globalSystem.uiManager.dialog.addButton(0, tutorial.button, () =>
        {
            globalSystem.uiManager.dialog.close();
            this.finish(tutorial);
            this.check(timing);
        });

        var message = tutorial.message;
        if (StringExtension.isValid(tutorial.additionalMessage))
        {
            switch (tutorial.additionalMessage)
            {
                case "endlessInfo":
                    {
                        message += globalSystem.endlessManager.getEndlessInfo();
                    }
                    break;
                default:
                    break;
            }
        }

        globalSystem.uiManager.dialog.open(message);
    }

    finish(data)
    {
        this.finishedIds.push(data.id);

        if (StringExtension.isValid(data.openDate))
        {
            globalSystem.scenarioManager.openDateId(data.openDate);
            globalSystem.uiManager.exproler.setupLayout();
        }
    }
}

new TutorialManager();
