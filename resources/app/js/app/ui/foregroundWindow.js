class ForegroundWindow extends UIElement
{
    constructor()
    {
        super("foreground");
        this.window = null;
        this.light = null;
        this.elements = [];
        this.elementPool = [];
        this.animator = new Animator();
        this.shaker = new Shaker();
        this.moveAnim = null;
        this.fadeAnim = null;
    }

    get validElements()
    {
        var result = [];
        for (var element of this.elements)
        {
            if (element.removing)
            {
                continue;
            }
            if (element.removed)
            {
                continue;
            }
            result.push(element);
        }
        return result;
    }

    setup()
    {
        this.window = document.getElementById("fgImage");
        this.light = document.getElementById("fgImageLight");
        this.window.style.left = "0%";
        this.window.style.top = "0%";
        this.window.style.width = "100%";
        this.window.style.height = "100%";
    }

    update()
    {
        this.animator.update();
        this.shaker.update();

        for (var i = this.elements.length - 1; i >= 0; i--)
        {
            var element = this.elements[i];
            if (element.update())
            {
                this.elements.splice(i, 1);
                this.elementPool.push(element);
            }
        }
    }

    preload(id, type, costume)
    {
        for (var element of this.elements)
        {
            if (element.isSame(id, type, costume))
            {
                return;
            }
        }

        for (var element of this.elementPool)
        {
            if (element.isSame(id, type, costume))
            {
                return;
            }
        }

        var element = new ForegroundElement(this.window);
        element.setup(id, type, costume);
        this.elementPool.push(element);

        return element;
    }

    addImage(id, type, costume, position, fadeInSpeed = null,)
    {
        // すでに表示されているなら無視
        var newElementData = globalSystem.foregroundData.getData(id, type, costume);
        for (var already of this.validElements)
        {
            if (already.data.id == id && already.data.path == newElementData.path)
            {
                return already;
            }
        }

        // 同じIDのものを破棄
        var onComplete = this.removeExistElement(id, type, fadeInSpeed);

        // 前景を追加
        var element = this.getElementByPool(id, type, costume);
        element.show(position, fadeInSpeed, onComplete);
        this.elements.push(element);
        return element;
    }

    removeExistElement(id, type, fadeInSpeed, costume = ForegroundElement.defaultCostume)
    {
        var newElementData = globalSystem.foregroundData.getData(id, type, costume);
        if (newElementData == null)
        {
            return null;
        }

        // 同一IDのものを取得
        var oldElements = [];
        for (var already of this.elements)
        {
            if (already.removing || already.removed)
            {
                continue;
            }
            if (already.id == id)
            {
                oldElements.push(already);
            }
        }
        if (oldElements.length == 0)
        {
            return null;
        }

        // IDの同じものを破棄
        var removeOld = [];
        for (var old of oldElements)
        {
            const oldElement = old;
            //var crossFade = (oldElement.data.pauseType != newElementData.pauseType);
            var crossFade = true;
            if (crossFade)
            {
                // クロスフェードなら、ここで古い前景を削除
                oldElement.remove(fadeInSpeed);
            }
            else
            {
                // クロスフェードでないなら、新しいものを出し終わってから消す
                oldElement.reserveRemove();
                const remove = (finished) =>
                {
                    if (oldElement.removing)
                    {
                        oldElement.remove(fadeInSpeed);
                    }
                };
                removeOld.push(remove);
            }
        }

        var onComplete = (finished) =>
        {
            for (var remove of removeOld)
            {
                remove(finished);
            }
        };

        return onComplete;
    }

    getElement(id)
    {
        for (var element of this.validElements)
        {
            if (element.id != id)
            {
                continue;
            }
            return element;
        }
    }

    getElementByPool(id, type, costume)
    {
        for (var element of this.elementPool)
        {
            if (element.isSame(id, type, costume))
            {
                return element;
            }
        }

        var result = this.preload(id, type, costume);
        return result;
    }

    clearImage()
    {
        for (var element of this.elements)
        {
            element.remove();
        }
    }

    clear()
    {
        for (var element of this.elements)
        {
            element.delete();
        }
        for (var element of this.elementPool)
        {
            element.delete();
        }

        this.elements = [];
        this.elementPool = [];
    }

    setLight(type)
    {
        var data = globalSystem.backgroundLightData.getDataByKey("type", type);
        if (data == null)
        {
            return;
        }
        globalSystem.resource.loadBackgroundImage(this.light, data.path);
    }

    clearLight()
    {
        this.light.style.backgroundImage = null;
    }

    getWindowPosition()
    {
        var result = Element.getTranslate(this.window);
        return result;
    }

    getWindowScale()
    {
        var scale = Element.getScale(this.window);
        var result = scale.x * 100;
        return result;
    }

    setTransformAnimate(x, y, scale, time, easeType = "ease-out")
    {
        if (this.moveAnim != null)
        {
            this.animator.cancel(this.moveAnim);
            this.moveAnim = null;
        }

        var currentPos = this.getWindowPosition();
        var currentScale = this.getWindowScale();
        this.moveAnim = this.animator.transform(this.window, currentPos, { x: x, y: y }, 0, 0, { x: currentScale / 100, y: currentScale / 100 }, { x: parseFloat(scale) / 100, y: parseFloat(scale) / 100 }, time, easeType, null);
    }

    setOpacityAnimate(opacity, time, ease = "ease-out")
    {
        if (this.fadeAnim != null)
        {
            this.animator.cancel(this.fadeAnim);
            this.windowAnim = null;
        }

        var current = Number(this.window.style.opacity);
        this.fadeAnim = this.animator.opacity(this.window, current, opacity, time, ease);
    }

    shake(size, time)
    {
        var currentPos = this.getWindowPosition();
        var currentScale = this.getWindowScale();
        var addTransform = (x, y) =>
        {
            this.setTransformAnimate(currentPos.x + x, currentPos.y + y, currentScale, 0);
        };
        this.shaker.shake(size, time, addTransform);
    }
}

new ForegroundWindow();
