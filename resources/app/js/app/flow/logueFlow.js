class LogueFlow extends Flow
{
    constructor()
    {
        super("logue", false);
    }

    setupFlow()
    {
        globalSystem.uiManager.background.setImage(null);
        globalSystem.soundManager.pauseBgm();
        globalSystem.soundManager.pauseSe();
        globalSystem.uiManager.textLine[0].setupElement("logue");
        globalSystem.uiManager.textLine[0].reset();
        var scenario = globalSystem.questManager.currentScenario;
        if (scenario != null && scenario.logueImage)
        {
            globalSystem.uiManager.textLine[survivor.index].setImage(scenario.logueImage);
        }

        // カメラ演出
        globalSystem.cameraManager.request("enterQuest00");
        globalSystem.cameraManager.request("enterQuest01");
        globalSystem.cameraManager.enableRandomMove();

        // サバイバーのロックを強制解除
        globalSystem.survivorManager.unlockForce();
    }

    updateFlow()
    {
        globalSystem.questManager.updateQuest();
        globalSystem.survivorManager.updateSurvivors();
    }

    exitFlow()
    {
        globalSystem.cameraManager.disableRandomMove();
        globalSystem.uiManager.background.clearImage(1);
    }
}