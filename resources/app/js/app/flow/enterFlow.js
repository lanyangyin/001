class EnterFlow extends Flow
{
    constructor()
    {
        super("", true);

        this.enterGateway = true;
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
        if (GameModeSetting.isInvalid)
        {
            GameModeSetting.openSelectDialog((mode) =>
            {
                this.enterGateway = true;
            });
            this.enterGateway = false;
        }
    }

    updateFlow()
    {
        if (this.enterGateway == false)
        {
            return;
        }
        globalSystem.flowManager.setFlow(new GatewayFlow());
    }

    exitFlow()
    {
    }
}
