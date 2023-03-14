class CreditWindow extends UIElement
{
    constructor()
    {
        super("credit");
        this.closeButton = null;
        this.window = null;
        this.animator = new Animator();
        this.windowAnim = null;
    }

    setup()
    {
        this.window = document.getElementById("credit");
        this.closeButton = document.getElementById("creditClose");
        this.closeButton.onclick = function (owner)
        {
            return function ()
            {
                owner.close();
            };
        }(this);
    }

    update()
    {
        this.animator.update();
    }

    open()
    {
        if (this.windowAnim != null)
        {
            return;
        }

        var onEnd = () =>
        {
            this.windowAnim = null;
        };
        this.window.style.display = "inline";
        this.windowAnim = this.animator.opacity(this.window, 0, 1, 0.5, "ease-out", onEnd);
    }

    close()
    {
        if (this.windowAnim != null)
        {
            return;
        }

        var onEnd = () =>
        {
            this.window.style.display = "none";
            this.windowAnim = null;
        };
        this.windowAnim = this.animator.opacity(this.window, 1, 0, 0.5, "ease-out", onEnd);
    }
}

new CreditWindow();
