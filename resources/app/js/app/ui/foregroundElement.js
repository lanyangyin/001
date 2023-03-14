class ForegroundElement
{
    constructor(window)
    {
        this.id = null;
        this.type = null;
        this.costume = null;
        this.positionType = null;
        this.data = null;
        this.layout = null;
        this.parent = null;
        this.image = null;
        this.shadow = null;
        this.fadeAnimParent = null;
        this.fadeAnimImage = null;
        this.transformAnimParent = null;
        this.transformAnimImage = null;
        this.removing = false;
        this.removed = false;

        this.animator = new Animator();

        this.createElements(window);
    }

    static get side()
    {
        var result =
        {
            left: "left",
            center: "center",
            right: "right",
        };
        return result;
    }

    static get defaultType()
    {
        return "default";
    }

    static get defaultCostume()
    {
        return "default";
    }

    setup(id, type, costume = ForegroundElement.defaultCostume)
    {
        this.id = id;
        this.type = type;
        this.costume = costume;
        this.data = globalSystem.foregroundData.getData(this.id, this.type, costume);

        this.parent.style.width = this.data.width + "%";
        this.parent.style.height = this.data.height + "%";

        globalSystem.resource.loadBackgroundImage(this.image, this.data.path);
        this.disable();
    }

    update()
    {
        this.animator.update();

        if (this.removed)
        {
            this.fadeAnimParent = null;
            this.fadeAnimImage = null;
            this.transformAnimParent = null;
            this.transformAnimImage = null;
        }

        return this.removed;
    }

    createElements(window)
    {
        this.parent = document.createElement("div");
        this.parent.className = "app";
        this.parent.style.top = 0 + "%";
        this.parent.style.left = 0 + "%";
        this.parent.style.width = 0 + "%";
        this.parent.style.height = 0 + "%";
        this.parent.style.opacity = 1;
        window.appendChild(this.parent);

        this.image = document.createElement("div");
        this.image.className = "app";
        this.image.style.top = "0%";
        this.image.style.left = "0%";
        this.image.style.width = "100%";
        this.image.style.height = "100%";
        this.image.style.zIndex = 0;
        this.image.style.opacity = 1;
        this.parent.appendChild(this.image);

        this.disable();

        /*
        var shadow = document.createElement("div");
        shadow.className = "app";
        shadow.style.top = "2%";
        shadow.style.left = "-6%";
        shadow.style.width = "100%";
        shadow.style.height = "100%";
        shadow.style.zIndex = -1;
        shadow.style.opacity = 0.5;
        var paths = path.split(".");
        var shadowPath = paths[0] + "_shadow" + "." + paths[1];
        shadow.style.backgroundImage = `url(${shadowPath})`;
        parent.appendChild(shadow);
        */
    }

    show(position, fadeInSpeed = null, onComplete = null)
    {
        this.positionType = position;
        this.removing = false;
        this.removed = false;

        if (this.data == null)
        {
            return;
        }

        this.layout = globalSystem.foregroundData.getLayout(position);
        if (this.layout == null)
        {
            return;
        }

        var scale = Number(this.layout.scale);
        var top = Number(this.layout.top) + (Number(this.data.offsetTop) * scale);
        var left = Number(this.layout.left) + (Number(this.data.offsetLeft) * scale);
        var width = Number(this.data.width) * scale;
        var height = Number(this.data.height) * scale;
        var zIndex = Number(this.data.zIndex);

        this.parent.style.top = top + "%";
        this.parent.style.left = left + "%";
        this.parent.style.width = width + "%";
        this.parent.style.height = height + "%";
        this.parent.style.opacity = 1;
        this.parent.style.zIndex = zIndex;

        this.enable();

        if (fadeInSpeed != null)
        {
            this.parent.style.opacity = 0;
            this.fadeIn(fadeInSpeed, false, onComplete);
        }
        else
        {
            if (onComplete != null)
            {
                onComplete(true);
            }
        }
    }

    enable()
    {
        this.parent.style.display = "inline";
    }

    disable()
    {
        this.parent.style.display = "none";
    }

    remove(fadeOutSpeed = null)
    {
        this.removing = true;

        if (fadeOutSpeed == null)
        {
            this.disable();
            this.removed = true;
        }
        else
        {
            var onEnd = function (element)
            {
                return function (finished)
                {
                    if (finished && element.removing)
                    {
                        element.disable();
                        element.removed = true;
                    }
                };
            }(this);
            this.fadeOut(fadeOutSpeed, false, onEnd);
        }
    }

    reserveRemove()
    {
        this.removing = true;
    }

    delete()
    {
        this.parent.remove();
        this.removed = true;
    }

    isSame(id, type, costume)
    {
        var result = (this.id == id && this.type == type && this.costume == costume);
        return result;
    }

    setOpacityAnimate(opacity, fadeTime, ease = "linear", imageOnly = false, onEnd = null)
    {
        if (imageOnly)
        {
            if (this.fadeAnimImage != null && this.fadeAnimImage.finished == false)
            {
                this.animator.cancel(this.fadeAnimImage, true);
                this.fadeAnimImage = null;
            }
            var current = Number(this.image.style.opacity);
            this.fadeAnimImage = this.animator.opacity(this.image, current, opacity, fadeTime, ease, onEnd);
        }
        else
        {
            if (this.fadeAnimParent != null && this.fadeAnimParent.finished == false)
            {
                this.animator.cancel(this.fadeAnimParent, true);
                this.fadeAnimParent = null;
            }
            var current = Number(this.parent.style.opacity);
            this.fadeAnimParent = this.animator.opacity(this.parent, current, opacity, fadeTime, ease, onEnd);
        }
    }

    fadeIn(time, imageOnly = false, onEnd = null, opacity = 1)
    {
        this.setOpacityAnimate(opacity, time, "ease-in", imageOnly, onEnd);
    }

    fadeOut(time, imageOnly = false, onEnd = null, opacity = 0)
    {
        this.setOpacityAnimate(opacity, time, "ease-out", imageOnly, onEnd);
    }

    walkIn(time, imageOnly = false)
    {
        var x = 0;
        if (this.layout.side == ForegroundElement.side.left)
        {
            x = -3;
        }
        else
        {
            x = 3;
        }
        var imagePos = { x: x, y: 0 };
        var imageTargetPos = { x: 0, y: 0 };
        this.walk(imagePos, imageTargetPos, time, imageOnly);
        this.fadeIn(time, imageOnly);
    }

    walkOut(time, imageOnly = false)
    {
        var x = 0;
        if (this.layout.side == ForegroundElement.side.left)
        {
            x = -3;
        }
        else
        {
            x = 3;
        }
        var imagePos = { x: 0, y: 0 };
        var imageTargetPos = { x: x, y: 0 };
        this.walk(imagePos, imageTargetPos, time, imageOnly);
        this.fadeOut(time, imageOnly);
    }

    walk(pos0, pos1, time, imageOnly = false)
    {
        if (imageOnly)
        {
            if (this.transformAnimImage != null)
            {
                this.animator.cancel(this.transformAnimImage);
                this.transformAnimImage = null;
            }
            this.transformAnimImage = this.animator.transform(this.image, pos0, pos1, 0, 0, { x: 1, y: 1 }, { x: 1, y: 1 }, time, "ease-out");
        }
        else
        {
            if (this.transformAnimParent != null)
            {
                this.animator.cancel(this.transformAnimParent);
                this.transformAnimParent = null;
            }
            this.transformAnimParent = this.animator.transform(this.parent, pos0, pos1, 0, 0, { x: 1, y: 1 }, { x: 1, y: 1 }, time, "ease-out");
        }
    }
}

