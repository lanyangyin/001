class OverlayWindow extends UIElement
{
    constructor()
    {
        super("overlay");
        this.animator = new Animator();
        this.window = null;
        this.images = [];
    }

    static get imageCount()
    {
        return 3;
    }

    setup()
    {
        this.window = document.getElementById("overlay");
        for (var i = 0; i < OverlayWindow.imageCount; i++)
        {
            var image = document.getElementById(`overlayImage${i}`);
            image.style.display = "none";
            this.images.push(image);
        }
    }

    update()
    {
        this.animator.update();
    }

    fadeIn(id, layer, time)
    {
        var data = globalSystem.backgroundData.getDataById(id);
        if (data == null)
        {
            return;
        }

        globalSystem.resource.loadBackgroundImage(this.images[layer], data.path, () =>
        {
            this.images[layer].style.display = "inline";
            this.images[layer].style.opacity = 0;
            this.animator.opacity(this.images[layer], 0, 1, time, "linear", null);
        });
    }

    fadeOut(layer, time)
    {
        this.animator.opacity(this.images[layer], 1, 0, time, "linear", () =>
        {
            this.images[layer].style.display = "none";
            this.images[layer].style.opacity = 0;
        });
    }

    clear()
    {
        for (var i = 0; i < OverlayWindow.imageCount; i++)
        {
            this.images[i].style.display = "none";
            this.images[i].style.opacity = 0;
        }
    }
}

new OverlayWindow();
