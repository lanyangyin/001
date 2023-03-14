class SplashFlow extends Flow
{
    constructor()
    {
        super("splash", false);
        this.timer = 1.5;
        this.completed = false;
    }

    get isSaveOnExit()
    {
        return false;
    }

    setupFlow()
    {
        this.timer = 1.5;
        this.completed = false;

        var window = document.getElementById(this.elementId);
        window.addEventListener("click", function (owner)
        {
            return function (event)
            {
                owner.next();
            };
        }(this), false);

        globalSystem.uiManager.option.disable();
        globalSystem.uiManager.question.disable();
    }

    updateFlow()
    {
        this.timer -= globalSystem.time.deltaTime;
        if (this.timer < 0)
        {
            this.next();
        }
    }

    exitFlow()
    {
    }

    next()
    {
        if (this.completed)
        {
            return;
        }

        globalSystem.flowManager.setFlow(new CautionFlow());
        this.completed = true;
    }
}