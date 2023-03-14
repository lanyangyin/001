class Event
{
    constructor(type, time, count)
    {
        this.type = type;
        this.requiredTime = time * 1.0;
        this.executeLimit = count;

        this.valid = true;
        this.executeCount = 0;
        this.callWord = null;
        this.executeType = Event.executeType.none;
        this.sound = null;
        this.onEnd = null;
        this.target = null;
        this.isExecuting = false;
        this.parentEvent = null;
        this.beforeEvents = [];
        this.canceled = false;
    }

    static get executeType()
    {
        var type =
        {
            none: -1,
            stage: 0,
            event: 1,
            call: 2,
            quest: 3,
        };
        return type;
    }

    get tags()
    {
        return [];
    }

    get isExecuteLimit()
    {
        if (this.executeLimit < 0)
        {
            return false;
        }

        var result = (this.executeCount >= this.executeLimit);
        return result;
    }

    setup(survivor, stage)
    {
        this.isExecuting = true;

        if (this.canceled)
        {
            return;
        }

        this.setupEvent(survivor, stage);

        if (this.sound != null)
        {
            globalSystem.soundManager.playSe(this.sound);
        }
    }

    execute(survivor, stage)
    {
        if (this.canceled)
        {
            this.onCanceled(survivor, stage);
            return true;
        }

        var result = this.executeEvent(survivor, stage);
        return result;
    }

    exit(survivor, stage)
    {
        this.exitEvent(survivor, stage);

        if (this.onEnd != null)
        {
            this.onEnd(this);
        }

        var useStamina = this.getUseStamina();
        if (useStamina > 0 && this.canceled == false)
        {
            survivor.useStamina(useStamina);
        }

        if (this.isExecuteLimit)
        {
            SurvivorCallHandler.registerHistory(this);
        }

        this.isExecuting = false;
    }

    cancel()
    {
        this.canceled = true;
    }

    onCanceled(survivor, stage)
    {
    }

    call(word)
    {
        this.callWord = word;
    }

    setupEvent(survivor, stage)
    {
    }

    executeEvent(survivor, stage)
    {
        return true;
    }

    exitEvent(survivor, stage)
    {
    }

    getCallWords(survivor, stage)
    {
        return [];
    }

    isCallWordIncludes()
    {
        return false;
    }

    getProbability(survivor, stage)
    {
        return 1.0;
    }

    getUseStamina()
    {
        return 1.0;
    }

    isUseSurvivorSpeed()
    {
        return true;
    }

    isSkipTimer()
    {
        return false;
    }

    isContinuable()
    {
        return false;
    }

    isWaitInput()
    {
        return false;
    }

    hasTag(tag)
    {
        var result = this.tags.indexOf(tag) != -1;
        return result;
    }

    onPushed(survivor, stage)
    {
        this.executeCount++;
        if (stage != null && this.isExecuteLimit)
        {
            stage.removeEvent(this);
        }
    }

    onGetBeforeEvents(survivor, stage)
    {
    }

    getBeforeEvents(survivor, stage)
    {
        this.onGetBeforeEvents(survivor, stage);
        var result = this.beforeEvents;
        this.beforeEvents = [];
        return result;
    }
}