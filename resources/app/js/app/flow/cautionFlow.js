class CautionFlow extends Flow
{
    constructor()
    {
        super("caution", false);
        this.clicked = false;
    }

    get isSaveOnExit()
    {
        return false;
    }

    setupFlow()
    {
        var window = document.getElementById(this.elementId);
        window.addEventListener("click", function (owner)
        {
            return function (event)
            {
                owner.clicked = true;
            };
        }(this), false);
    }

    updateFlow()
    {
        if (this.clicked)
        {
            globalSystem.flowManager.setFlow(new TitleFlow());
        }
    }

    exitFlow()
    {
    }
}