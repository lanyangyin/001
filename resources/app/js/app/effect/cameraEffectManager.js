class CameraEffectManager extends GlobalManager
{
    constructor()
    {
        super("cameraManager");

        this.nextBg = null;
        this.nextFg = null;
        this.nextBgTimer = 0;
        this.nextFgTimer = 0;
        this.randomMove = false;
        this.animationCut = false;
    }

    update()
    {
        this.undateNext();
        this.updateRandomMove();
    }

    request(id)
    {
        var datas = globalSystem.cameraData.getDatasById(id);
        if (datas == null)
        {
            return;
        }

        for (var data of datas)
        {
            if (data.target == "bg")
            {
                this.animateNextBg(data);
            }
            if (data.target == "fg")
            {
                this.animateNextFg(data);
            }
        }
    }

    requestBg(id)
    {
        var datas = globalSystem.cameraData.getDatasById(id);
        if (datas == null)
        {
            return;
        }

        for (var data of datas)
        {
            if (data.target == "bg")
            {
                this.animateNextBg(data);
            }
        }
    }

    requestFg(id)
    {
        var datas = globalSystem.cameraData.getDatasById(id);
        if (datas == null)
        {
            return;
        }

        for (var data of datas)
        {
            if (data.target == "fg")
            {
                this.animateNextFg(data);
            }
        }
    }

    requestRandom(type)
    {
        var data = globalSystem.cameraData.getDataByRandom(type);
        if (data == null)
        {
            return;
        }

        var id = data.id;
        this.request(id);
    }

    requestBgRandom(type)
    {
        var data = globalSystem.cameraData.getDataByRandom(type);
        if (data == null)
        {
            return;
        }

        var id = data.id;
        this.requestBg(id);
    }

    requestFgRandom(type)
    {
        var data = globalSystem.cameraData.getDataByRandom(type);
        if (data == null)
        {
            return;
        }

        var id = data.id;
        this.requestFg(id);
    }

    animateNextBg(data)
    {
        if (Number(data.time) > 0)
        {
            this.nextBg = data;
        }
        else
        {
            this.animateBg(data);
        }
    }

    animateNextFg(data)
    {
        if (Number(data.time) > 0)
        {
            this.nextFg = data;
        }
        else
        {
            this.animateFg(data);
        }
    }

    animateBg(data)
    {
        globalSystem.uiManager.background.setTransformAnimate(data.x, data.y, data.scale, data.time, data.ease);
    }

    animateFg(data)
    {
        globalSystem.uiManager.foreground.setTransformAnimate(data.x, data.y, data.scale, data.time, data.ease);
        if (StringExtension.isNullOrEmpty(data.opacity) == false)
        {
            globalSystem.uiManager.foreground.setOpacityAnimate(data.opacity, data.time, data.ease);
        }

        var elements = globalSystem.uiManager.foreground.validElements;
        for (var element of elements)
        {
            element.fadeIn(1);
        }
    }

    enableRandomMove()
    {
        this.randomMove = true;
    }

    disableRandomMove()
    {
        this.randomMove = false;
    }

    enableAnimationCut()
    {
        this.animationCut = true;
    }

    disableAnimationCut()
    {
        this.animationCut = false;
    }

    focusSurvivor(survivor)
    {
        var fg = globalSystem.uiManager.foreground.getElement(survivor.image);
        if (fg == null)
        {
            return;
        }

        var side = fg.layout.side;
        var camera = `focusFg-${side}`;
        this.requestRandom(camera);

        var elements = globalSystem.uiManager.foreground.validElements;
        for (var element of elements)
        {
            if (element == fg)
            {
                continue;
            }
            element.fadeOut(1, false, null, 0.5);
        }
    }

    undateNext()
    {
        if (this.nextBgTimer > 0)
        {
            this.nextBgTimer -= globalSystem.time.deltaTime;
        }
        else
        {
            if (this.nextBg != null)
            {
                this.animateBg(this.nextBg);
                this.nextBg = null;
                this.nextBgTimer = 0.5;
            }
        }

        if (this.nextFgTimer > 0)
        {
            this.nextFgTimer -= globalSystem.time.deltaTime;
        }
        else
        {
            if (this.nextFg != null)
            {
                this.animateFg(this.nextFg);
                this.nextFg = null;
                this.nextFgTimer = 0.5;
            }
        }
    }

    updateRandomMove()
    {
        if (this.randomMove == false)
        {
            return;
        }

        if (this.animationCut)
        {
            return;
        }

        if (globalSystem.uiManager.background.isAnimation)
        {
            return;
        }

        this.requestRandom("moveBg");
        this.requestRandom("moveFg");
    }

    resetTimer()
    {
        this.nextBgTimer = 0;
        this.nextFgTimer = 0;
    }

    focusBg()
    {
        this.requestRandom("focusBg");
    }

    focusReset()
    {
        this.request("reset01");
    }

    focusResetBg()
    {
        this.requestBg("reset01");
    }

    focusResetFg()
    {
        this.requestFg("reset01");
    }

    resetAll()
    {
        this.request("reset00");
    }
}

new CameraEffectManager();
