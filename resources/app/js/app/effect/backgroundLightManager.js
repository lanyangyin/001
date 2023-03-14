class BackgroundLightManager extends GlobalManager
{
    constructor()
    {
        super("lightManager");
        this.enabled = true;
        this.canvas = null;
        this.context = null;
        this.images = [];
        this.timer = 0;
    }

    static get width()
    {
        return 480;
    }

    static get height()
    {
        return 270;
    }

    static get maxAlpha()
    {
        return 1;
    }

    setup()
    {
        this.canvas = document.getElementById("bgImageLight");
        this.canvas.width = BackgroundLightManager.width;
        this.canvas.height = BackgroundLightManager.height;
        this.context = this.canvas.getContext("2d");
    }

    update()
    {
        if (this.enabled == false)
        {
            return;
        }
        this.updateTimer();
        this.drawLight();
    }

    enable()
    {
        this.enabled = true;
        this.canvas.style.display = "inline";
    }

    disable()
    {
        this.enabled = false;
        this.canvas.style.display = "none";
    }

    setLight(type)
    {
        this.images = [];

        var datas = globalSystem.backgroundLightData.getDatasByKey("type", type);
        for (var i = 0; i < datas.length; i++)
        {
            const index = i;
            const image = new Image();
            image.onload = () =>
            {
                var canvas = document.createElement("canvas");
                canvas.width = BackgroundLightManager.width;
                canvas.height = BackgroundLightManager.height;
                var context = canvas.getContext("2d");
                context.drawImage(image, 0, 0, BackgroundLightManager.width, BackgroundLightManager.height);
                this.images[index] = canvas;
            };
            image.src = datas[i].path;

            this.images.push(null);
        }
    }

    clearLight()
    {
        this.context.clearRect(0, 0, BackgroundLightManager.width, BackgroundLightManager.height);
        this.images = [];
    }

    updateTimer()
    {
        var speed = 1.5;
        this.timer += globalSystem.time.deltaTime * speed;

        if (this.timer > this.images.length)
        {
            this.timer = 0;
        }
    }

    drawLight()
    {
        if (this.images.length == 0)
        {
            return;
        }

        this.context.clearRect(0, 0, BackgroundLightManager.width, BackgroundLightManager.height);

        var length = this.images.length;
        var index = parseInt(this.timer) % length;
        var ratio = this.timer - parseInt(this.timer);
        var alpha = ratio;
        if (alpha > BackgroundLightManager.maxAlpha)
        {
            alpha = BackgroundLightManager.maxAlpha;
        }
        this.drawImage(index, alpha);

        var prevIndex = index - 1;
        var prevAlpha = 1 - ratio;
        if (prevAlpha > BackgroundLightManager.maxAlpha)
        {
            prevAlpha = BackgroundLightManager.maxAlpha;
        }
        this.drawImage(prevIndex, prevAlpha);
    }

    drawImage(index, alpha)
    {
        if (index < 0)
        {
            index += this.images.length;
        }

        if (index >= this.images.length)
        {
            index -= this.images.length;
        }

        var image = this.images[index];
        if (image == null)
        {
            return;
        }

        this.context.save();
        this.context.globalCompositeOperation = "lighter";
        this.context.globalAlpha = alpha;
        this.context.drawImage(image, 0, 0);
        this.context.restore();
    }
}

new BackgroundLightManager();