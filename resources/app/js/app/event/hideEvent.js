class HideEvent extends Event
{
    constructor()
    {
        super("hide", 3, 1);
    }

    setupEvent(survivor, stage)
    {
        survivor.speak("hideable", []);
        survivor.speak("hide", []);
    }

    executeEvent(survivor, stage)
    {
        stage.pushOption(new StageOptionNoBattle());

        // テキストはランダム
        if (Random.range(2) == 0)
        {
            survivor.speak("hideSuccess", []);
        }
        else
        {
            survivor.speak("hideEnd", []);
        }

        return true;
    }
}
