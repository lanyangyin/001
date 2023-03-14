class PlatformSetting
{
    constructor()
    {
        /* nop */
    }

    static apply()
    {
        if (Platform.isMobile)
        {
            globalSystem.uiManager.window.width = 1920;
            globalSystem.uiManager.window.height = 1080;
        }
        else
        {
            globalSystem.uiManager.window.width = 1920;
            globalSystem.uiManager.window.height = 1080;
        }
    }
}
