class FindEvent extends Event
{
    constructor(arg)
    {
        super("find", 0, 1);

        this.size = arg[0];
        this.results = [arg[1], arg[2], arg[3]];
        this.object = null;
    }

    setupEvent(survivor, stage)
    {
        if (stage == null)
        {
            return;
        }

        // 10回試行して、有効なオブジェクトが見つからなければあきらめる
        for (var i = 0; i < 10; i++)
        {
            this.object = this.getObjectData(survivor, stage);
            if (this.object != null)
            {
                break;
            }
        }

        globalSystem.cameraManager.focusBg();
    }

    executeEvent(survivor, stage)
    {
        if (this.object == null)
        {
            survivor.speak("nothing", []);
            return true;
        }

        var keyword = this.object.keyword;
        var button = `<button>${keyword}</button>`;
        survivor.speak(this.type, [button]);

        var callObject = new CallObjectEvent(this.object);
        stage.pushEvent(callObject);

        return true;
    }

    getObjectData(survivor, stage)
    {
        var result = globalSystem.stageObjectData.getRandomBySize(this.size, stage.data.objectTypes);
        if (result == null)
        {
            return null;
        }

        for (var event of stage.events)
        {
            if (event == null)
            {
                continue;
            }
            if (event == this)
            {
                continue;
            }
            var probability = event.getProbability(survivor, stage);
            if (probability <= 0)
            {
                continue;
            }
            if ((event instanceof CallObjectEvent) == false)
            {
                continue;
            }
            if (event.object == null)
            {
                continue;
            }

            // 同じ名前のものは避ける
            if (event.object.keyword == result.keyword)
            {
                return null;
            }
        }

        return result;
    }
}