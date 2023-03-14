class AutoPlayEnding extends AutoPlayFlow
{
    static update()
    {
        globalSystem.flowManager.currentFlow.timer = 0;
    }
}
