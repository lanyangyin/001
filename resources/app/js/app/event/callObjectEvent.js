class CallObjectEvent extends Event
{
    constructor(object, overwriteId = null)
    {
        super("callObject", 3, 1);
        this.object = object;
        this.words = [object.keyword, object.name];
        this.resultEvent = null;
        this.overwriteId = overwriteId;
        this.findSpoke = false;
        this.calledStage = null;
        this.resultOverwrite = false;
        this.overwriteProbability = -1;

        if (StringExtension.isValid(object.image))
        {
            globalSystem.uiManager.background.loadImage(object.image);
        }
    }

    setupEvent(survivor, stage)
    {
        this.resultEvent = null;
        this.resultOverwrite = false;
    }

    executeEvent(survivor, stage)
    {
        var result = this.updateResult(survivor, stage);
        if (result && this.resultEvent != null)
        {
            // イベント発生
            survivor.insertEvent(this.resultEvent, this.executeType);
        }

        return result;
    }

    exitEvent(survivor, stage)
    {
        globalSystem.survivorManager.unlock(survivor);

        if (this.resultEvent == null)
        {
            globalSystem.cameraManager.focusReset();
        }
    }

    onPushed(survivor, stage)
    {
        super.onPushed(survivor, stage);

        this.calledStage = stage;
    }

    updateResult(survivor, stage)
    {
        if (this.overwriteId != null)
        {
            var data = globalSystem.callObjectData.getDataById(this.overwriteId);
            if (data == null)
            {
                return true;
            }
            var event = EventGenerator.generate(data.eventType, this);
            if (event == null)
            {
                return true;
            }
            event.forceRemove = true;
            this.resultEvent = event;
            this.resultOverwrite = true;
            return true;
        }

        var interact = new ItemInteractEvent(survivor, this.object, this);
        if (interact.isValid())
        {
            this.resultEvent = interact;
            this.resultOverwrite = true;
            return true;
        }

        var id = survivor.callObject;
        var data = globalSystem.callObjectData.getDataById(id);
        if (data == null)
        {
            return true;
        }
        var event = EventGenerator.generate(data.eventType, this);
        if (event == null)
        {
            return true;
        }
        this.resultEvent = event;
        this.resultOverwrite = false;
        return true;
    }

    getCallWords(survivor, stage)
    {
        return this.words;
    }

    getProbability(survivor, stage)
    {
        if (this.object == null)
        {
            return 0;
        }

        if (this.overwriteId != null)
        {
            return 1.0;
        }

        if (this.resultOverwrite)
        {
            return 1.0;
        }

        var result = Number(this.object.eventProbability);
        if (result <= 0)
        {
            return 0;
        }

        if (this.overwriteProbability != -1)
        {
            return this.overwriteProbability;
        }

        var staminaRatio = survivor.staminaRatio;
        if (staminaRatio < 0.5)
        {
            return staminaRatio;
        }

        var hasBeforeEvent = (this.beforeEvents.length > 0);
        if (hasBeforeEvent)
        {
            return 0.3;
        }

        return result;
    }

    onGetBeforeEvents(survivor, stage)
    {
        if (this.findSpoke)
        {
            return;
        }

        if (this.object == null)
        {
            return;
        }

        if (this.executeType != Event.executeType.call)
        {
            return;
        }

        if (StringExtension.isValid(this.object.speak))
        {
            survivor.speak("callObject", [this.object.keyword]);
        }
        this.findSpoke = true;
    }
}