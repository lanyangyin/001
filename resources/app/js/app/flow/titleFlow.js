class TitleFlow extends Flow
{
    constructor()
    {
        super("title", true);
        this.logoRequested = false;
        this.logoDelayTimer = 2;
    }

    get fadeTime()
    {
        return 2;
    }

    setupFlow()
    {
        globalSystem.gameManager.load();

        globalSystem.flagManager.check("title");

        var image = "title00";
        var scenarioId = globalSystem.scenarioManager.temporaryScenarioId;
        if (scenarioId != null)
        {
            var lastScenario = globalSystem.scenarioData.getDataById(scenarioId);
            if (lastScenario != null)
            {
                image = lastScenario.titleImage;
            }
        }
        else
        {
            var scenario = globalSystem.scenarioManager.getLastScenario();
            if (scenario != null && StringExtension.isValid(scenario.titleImage))
            {
                image = scenario.titleImage;
            }
        }

        globalSystem.uiManager.title.init();
        globalSystem.uiManager.title.setImage(image);
        globalSystem.uiManager.title.removeLogo();
        globalSystem.soundManager.playBgm("title00");

        var overlayLength = globalSystem.titleData.getLength(0);
        for (var i = 0; i < overlayLength; i++)
        {
            var data = globalSystem.titleData.getDataByIndex(0, i);
            if (data == null)
            {
                continue;
            }
            if (globalSystem.scenarioManager.isFinished(data.finishedScenario) == false)
            {
                continue;
            }
            globalSystem.uiManager.title.setOverlayImage(i, data.id);
        }

        globalSystem.uiManager.option.enable();
        globalSystem.uiManager.question.disable();
    }

    updateFlow()
    {
        if (this.logoRequested == false)
        {
            this.logoDelayTimer -= globalSystem.time.deltaTime;
            if (this.logoDelayTimer < 0)
            {
                globalSystem.uiManager.title.fadeInLogo("logo00");
                this.logoRequested = true;
            }
        }
    }

    exitFlow()
    {
        globalSystem.soundManager.pauseBgm();
        globalSystem.soundManager.pauseSe();
    }
}