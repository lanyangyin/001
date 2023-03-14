class RebootFlow extends Flow
{
    constructor()
    {
        super("", true);
    }

    get fadeIn()
    {
        return false;
    }

    get fadeOut()
    {
        return true;
    }

    setupFlow()
    {
    }

    updateFlow()
    {
        globalSystem.flowManager.setFlow(new SplashFlow());
    }

    exitFlow()
    {
    }
}