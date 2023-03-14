class EndrollWindow extends UIElement
{
    constructor()
    {
        super("endroll");
        this.image = null;
        this.message = null;

        this.animator = new Animator();
    }

    setup()
    {
        this.image = document.getElementById("endrollImage");
        this.message = document.getElementById("endrollMessage");
    }

    update()
    {
        this.animator.update();
    }

    init()
    {
        this.image.style.opacity = 0;
        this.message.style.opacity = 0;
    }

    setImage(id)
    {
        var data = globalSystem.backgroundData.getDataById(id);
        if (data == null)
        {
            return;
        }

        var fadeIn = () =>
        {
            globalSystem.resource.loadBackgroundImage(this.image, data.path);
            this.animator.opacity(this.image, 0, 1, 1, "ease-out", null);
        };

        var current = Number(this.image.style.opacity);
        this.animator.opacity(this.image, current, 0, 1, "ease-out", fadeIn);
    }

    setMessage(text)
    {
        var fadeIn = () =>
        {
            this.message.innerHTML = text;
            this.animator.opacity(this.message, 0, 1, 1, "ease-out", null);
        };

        var current = Number(this.message.style.opacity);
        this.animator.opacity(this.message, current, 0, 1, "ease-out", fadeIn);
    }
}

new EndrollWindow();
