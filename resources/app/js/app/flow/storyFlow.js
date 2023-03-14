class StoryFlow extends Flow
{
    constructor()
    {
        super("story", false);
        this.overwriteScenario = null;
    }

    get isSaveOnExit()
    {
        return false;
    }

    setupFlow()
    {
        var image = null;
        var sound = "story00";
        var lastScenario = null;
        var index = 0;

        var scenarioId = globalSystem.scenarioManager.temporaryScenarioId;
        if (scenarioId != null)
        {
            lastScenario = globalSystem.scenarioData.getDataById(scenarioId);
            index = globalSystem.scenarioManager.finishId.length - 1 + 1;
        }
        else
        {
            index = globalSystem.uiManager.story.getLastScenarioIndexHasDescription();
            var finishIds = globalSystem.scenarioManager.finishId;
            if (this.overwriteScenario != null)
            {
                for (var i = finishIds.length - 1; i >= 0; i--)
                {
                    var scenario = globalSystem.scenarioData.getDataById(finishIds[i]);
                    if (scenario != null && (scenario.date == this.overwriteScenario.date || scenario.openDate == this.overwriteScenario.date))
                    {
                        index = i;
                        break;
                    }
                }
            }
            var id = finishIds[index];
            lastScenario = globalSystem.scenarioData.getDataById(id);
        }

        if (lastScenario != null)
        {
            image = lastScenario.storyImage;
            sound = lastScenario.storySound;
        }

        globalSystem.uiManager.background.setImage(image);
        globalSystem.cameraManager.request("enter00");
        globalSystem.cameraManager.request("enter01");
        globalSystem.cameraManager.enableRandomMove();

        globalSystem.soundManager.playBgm(sound);
        globalSystem.uiManager.menuTab.enable();

        globalSystem.uiManager.story.setupLayout(index, true);
    }

    updateFlow()
    {
    }

    exitFlow()
    {
        globalSystem.cameraManager.disableRandomMove();

        globalSystem.uiManager.menuTab.disable();
    }
}