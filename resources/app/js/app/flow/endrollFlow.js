class EndrollFlow extends Flow
{
    constructor(type)
    {
        super("endroll", false);
        this.type = type;
        this.list = [];
        this.index = 0;
        this.timer = 0;
        this.nextFlow = null;
    }

    get fadeTime()
    {
        return 2;
    }

    setupFlow()
    {
        this.list = globalSystem.endrollData.getDatasByKey("type", this.type);
        if (this.list.length > 0)
        {
            var data = this.list[0];
            switch (data.executeType)
            {
                case "image":
                    {
                        globalSystem.soundManager.playBgm("endroll00");
                        this.timer = 2;
                    }
                    break;
                case "movie":
                    {
                        this.timer = 0;
                    }
                    break;
                default:
                    break;
            }
        }

        globalSystem.uiManager.endroll.init();
        globalSystem.uiManager.background.clearImage();
        globalSystem.uiManager.foreground.clear();
        globalSystem.uiManager.option.disable();
        globalSystem.uiManager.question.disable();
    }

    updateFlow()
    {
        if (this.timer == -1)
        {
            return;
        }

        if (this.timer > 0)
        {
            this.timer -= globalSystem.time.deltaTime;
            return;
        }

        if (this.index >= this.list.length && this.nextFlow != null)
        {
            var flow = Class.getInstance(this.nextFlow);
            globalSystem.flowManager.setFlow(flow);
            return;
        }

        var data = this.list[this.index];
        this.timer = parseFloat(data.time);
        switch (data.executeType)
        {
            case "image":
                {
                    globalSystem.uiManager.endroll.setImage(data.resourceId);
                }
                break;
            case "movie":
                {
                    globalSystem.movieManager.play(data.resourceId, () =>
                    {
                        this.timer = 0;
                    });
                    this.timer = -1;
                }
                break;
            case "disableMovie":
                {
                    globalSystem.movieManager.disable();
                }
            case "text":
                {
                    if (StringExtension.isValid(data.text))
                    {
                        globalSystem.uiManager.endroll.setMessage(data.text);
                    }
                    else
                    {
                        globalSystem.uiManager.endroll.setMessage("");
                    }
                }
            case "fadeIn":
                {
                    var time = parseFloat(data.time);
                    globalSystem.uiManager.fade.in(time);
                }
                break;
            case "fadeOut":
                {
                    var time = parseFloat(data.time);
                    globalSystem.uiManager.fade.out(time);
                }
                break;
            case "wait":
                {
                    /* nop */
                }
                break;
            default:
                break;
        }

        if (StringExtension.isValid(data.nextFlow))
        {
            this.nextFlow = data.nextFlow;
        }

        this.index++;
    }

    exitFlow()
    {
        globalSystem.uiManager.option.enable();
        globalSystem.uiManager.question.enable();
    }
}