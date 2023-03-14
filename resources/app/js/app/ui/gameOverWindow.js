class GameOverWindow extends UIElement
{
    constructor()
    {
        super("gameOver");
        this.message = null;
        this.frame = null;
        this.continueButton = null;
        this.toTitleButton = null;
        this.animator = new Animator();
    }

    setup()
    {
        this.message = document.getElementById("gameOverMessage");
        this.frame = document.getElementById("gameOverFrame");
        this.continueButton = document.getElementById("gameOverContinue");
        this.continueButton.onclick = function ()
        {
            globalSystem.flowManager.setFlow(new GatewayFlow());
        };
        this.toTitleButton = document.getElementById("gameOverToTitle");
        this.toTitleButton.onclick = function ()
        {
            globalSystem.flowManager.setFlow(new TitleFlow());
        };
    }

    update()
    {
        this.animator.update();
    }

    playAnimation()
    {
        this.animator.opacity(this.message, 0, 1, 4, "ease-out");
        this.animator.opacity(this.frame, 0, 0.6, 4, "ease-out");
    }
}

new GameOverWindow();
