class ExprolerFlow extends Flow
{
    constructor()
    {
        super("exproler", false);
    }

    setupFlow()
    {
        globalSystem.uiManager.background.setImage("computer00");
        globalSystem.cameraManager.request("enter00");
        globalSystem.cameraManager.request("enter01");
        globalSystem.cameraManager.enableRandomMove();

        globalSystem.uiManager.exproler.setupLayout();
        globalSystem.uiManager.menuTab.enable();
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