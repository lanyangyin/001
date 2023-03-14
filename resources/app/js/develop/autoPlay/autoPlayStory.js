class AutoPlayStory extends AutoPlayFlow
{
    static update()
    {
        if (globalSystem.flowManager.nextFlow != null)
        {
            return;
        }

        var isMainScenarioFinished = globalSystem.flagManager.getFlagValue("mainScenarioFinished00");
        if (isMainScenarioFinished)
        {
            globalSystem.uiManager.menuTab.exprolerButton.onclick();
        }
        else
        {
            globalSystem.uiManager.story.target.onclick();
        }
    }
}
