class EndingFlow extends Flow
{
    constructor(id)
    {
        super("ending", false);
        this.id = id;
        this.timer = 10;
    }

    get fadeTime()
    {
        return 2;
    }

    setupFlow()
    {
        var data = globalSystem.endingData.getDataById(this.id);
        if (data == null)
        {
            globalSystem.flowManager.setFlow(new GatewayFlow());
            return;
        }

        globalSystem.uiManager.ending.setupText(data);
        globalSystem.cameraManager.request("ending00");
        globalSystem.cameraManager.request("ending01");

        var window = document.getElementById(this.elementId);
        window.addEventListener("click", function (owner)
        {
            return function (event)
            {
                owner.timer = 0;
            };
        }(this), false);
    }

    updateFlow()
    {
        var fadeComplete = globalSystem.uiManager.ending.updateFade();
        if (fadeComplete)
        {
            this.timer -= globalSystem.time.deltaTime;
            if (this.timer < 0)
            {
                globalSystem.flowManager.setFlow(new GatewayFlow());
            }
        }
    }

    exitFlow()
    {
    }
}