class BackgroundWindow extends UIElement
{
    constructor()
    {
        super("background");
        this.window = null;
        this.images = [];
        this.fadeTime = 2.0;
        this.moveAnim = null;
        this.scaleAnim = null;
        this.fadeAnims = [];
        this.delayEvent = null;
        this.animator = new Animator();
        this.shaker = new Shaker();
    }

    static get layerCount()
    {
        return 2;
    }

    get isAnimation()
    {
        return this.animator.isAnimation;
    }

    setup()
    {
        this.window = document.getElementById("bgImageWindow");
        this.images = [];
        for (var i = 0; i < BackgroundWindow.layerCount; i++)
        {
            var element = document.getElementById(`bgImage${i}`);
            this.images.push(element);
        }
    }

    update()
    {
        this.animator.update();
        this.shaker.update();
    }

    getImagePosition()
    {
        var result = Element.getTranslate(this.window);
        return result;
    }

    getImageScale()
    {
        var scale = Element.getScale(this.window);
        var result = scale.x * 100;
        return result;
    }

    setImage(id, layer = 0, fadeTime = 0)
    {
        var path = null;
        var data = globalSystem.backgroundData.getDataById(id);
        if (data != null)
        {
            path = data.path;
        }

        if (this.fadeAnims[layer] != null)
        {
            this.animator.cancel(this.fadeAnims[layer]);
            this.fadeAnims[layer] = null;
        }
        if (this.delayEvent != null)
        {
            clearTimeout(this.delayEvent);
            this.delayEvent = null;
        }
        if (path == null)
        {
            this.images[layer].style.backgroundImage = null;
            return;
        }
        globalSystem.resource.loadBackgroundImage(this.images[layer], path);
        this.fadeIn(fadeTime, layer);

        if (layer == 0)
        {
            this.setLight(data);
        }
    }

    loadImage(id)
    {
        var data = globalSystem.backgroundData.getDataById(id);
        if (data == null)
        {
            return;
        }
        globalSystem.resource.loadImage(data.path);
    }

    setLight(data)
    {
        if (StringExtension.isValid(data.light))
        {
            globalSystem.lightManager.setLight(data.light);
        }
        else
        {
            globalSystem.lightManager.clearLight();
        }

        if (StringExtension.isValid(data.fgLight))
        {
            globalSystem.uiManager.foreground.setLight(data.fgLight);
        }
        else
        {
            globalSystem.uiManager.foreground.clearLight();
        }
    }

    clearImage(layer = 0)
    {
        this.setImage(null, layer);
    }

    setTransformAnimate(x, y, scale, time, easeType = "linear")
    {
        if (this.moveAnim != null)
        {
            this.animator.cancel(this.moveAnim);
            this.moveAnim = null;
        }
        if (this.scaleAnim != null)
        {
            this.animator.cancel(this.scaleAnim);
            this.scaleAnim = null;
        }

        var currentPos = this.getImagePosition();
        var currentScale = this.getImageScale();
        this.moveAnim = this.animator.transform(this.window, currentPos, { x: x, y: y }, 0, 0, { x: currentScale / 100, y: currentScale / 100 }, { x: parseFloat(scale) / 100, y: parseFloat(scale) / 100 }, time, easeType, null);
    }

    setOpacityAnimate(opacity, fadeTime, ease = "linear", layer = 0)
    {
        if (this.fadeAnims[layer] != null)
        {
            this.animator.cancel(this.fadeAnims[layer]);
            this.fadeAnims[layer] = null;
        }
        var current = Number(this.images[layer].style.opacity);
        this.fadeAnims[layer] = this.animator.opacity(this.images[layer], current, opacity, fadeTime, ease, null);
    }

    fadeIn(fadeTime, layer = 0)
    {
        this.images[layer].style.opacity = 0;
        this.setOpacityAnimate(1, fadeTime, "linear", layer);
    }

    fadeOut(fadeTime, layer = 0)
    {
        this.setOpacityAnimate(0, fadeTime, "linear", layer);
    }

    shake(size, time)
    {
        var currentPos = this.getImagePosition();
        var currentScale = this.getImageScale();
        var addTransform = (x, y) =>
        {
            this.setTransformAnimate(currentPos.x + x, currentPos.y + y, currentScale, 0);
        };
        this.shaker.shake(size, time, addTransform);
    }
}

new BackgroundWindow();
