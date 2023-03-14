class SurvivorEventExecutor
{
    constructor()
    {
        this.callHandler = new SurvivorCallHandler();
        this.eventHolder = new SurvivorEventHolder();
        this.currentEvent = null;
        this.prevEvent = null;
        this.nextEvents = [];
    }

    get nextEvent()
    {
        if (this.nextEvents.length == 0)
        {
            return null;
        }
        return this.nextEvents[0];
    }

    update(survivor)
    {
        // 呼び出しイベントの更新
        this.callHandler.update(survivor);

        // テキストアニメーション中は待つ
        for (var textLine of globalSystem.uiManager.textLine)
        {
            if (textLine.isBusy)
            {
                return;
            }
        }

        // ステージ更新
        var stage = survivor.currentStage;
        if (stage != null)
        {
            stage.update(survivor);
        }

        // イベントの実行
        if (this.currentEvent != null)
        {
            if (this.currentEvent.execute(survivor, stage))
            {
                if (this.currentEvent != null)
                {
                    this.currentEvent.exit(survivor, stage);
                }
                this.prevEvent = this.currentEvent;
                this.currentEvent = null;
            }
        }
        else if (this.nextEvent != null)
        {
            var nextEvent = this.nextEvent;
            var beforeEvents = nextEvent.getBeforeEvents(survivor, stage);
            if (beforeEvents.length > 0)
            {
                // イベント前イベントを挿入
                for (var beforeEvent of beforeEvents)
                {
                    beforeEvent.parentEvent = nextEvent;
                    survivor.insertEvent(beforeEvent, nextEvent.executeType);
                }
            }
            else
            {
                this.nextEvents.shift();
                if (this.isValidNextEvent(survivor, nextEvent))
                {
                    this.currentEvent = nextEvent;
                    this.currentEvent.setup(survivor, stage);
                }
            }
        }
        else
        {
            this.eventHolder.update(survivor);

            if (stage != null)
            {
                var nextEvent = stage.getEvent(survivor);
                if (nextEvent != null && this.isValidNextEvent(survivor, nextEvent))
                {
                    survivor.pushEvent(nextEvent, Event.executeType.stage);
                }
            }
        }
    }

    onChangeStage(next, prev)
    {
        for (var i = this.nextEvents.length - 1; i >= 0; i--)
        {
            var event = this.nextEvents[i];
            if (event.executeType == Event.executeType.stage)
            {
                this.nextEvents = List.remove(this.nextEvents, event);
                if (prev != null)
                {
                    prev.pushEvent(event);
                }
            }
        }
    }

    reset()
    {
        this.eventHolder.reset();
        this.currentEvent = null;
        this.prevEvent = null;
        this.nextEvents = [];
    }

    pushNext(survivor, event)
    {
        if (event != null)
        {
            event.onPushed(survivor, survivor.currentStage);
        }
        this.nextEvents.push(event);
    }

    insertNext(survivor, event)
    {
        if (event != null)
        {
            event.onPushed(survivor, survivor.currentStage);
        }
        this.nextEvents.unshift(event);
    }

    removeNext(event)
    {
        this.nextEvents = List.remove(this.nextEvents, event);
    }

    clearNexts()
    {
        this.nextEvents = [];
    }

    getEventsByType(eventType)
    {
        var result = [];
        if (this.currentEvent != null)
        {
            if (this.currentEvent instanceof eventType)
            {
                result.push(this.currentEvent);
            }
        }
        for (var next of this.nextEvents)
        {
            if (next instanceof eventType)
            {
                result.push(next);
            }
        }
        return result;
    }

    hasEvent(eventType)
    {
        var events = this.getEventsByType(eventType);
        var result = events.length > 0;
        return result;
    }

    isValidNextEvent(survivor, event)
    {
        if (event == null)
        {
            return false;
        }

        if (event.valid == false)
        {
            return false;
        }

        if (event.isExecuting)
        {
            return false;
        }

        var validTarget = (event.target == null || event.target == survivor);
        if (validTarget == false)
        {
            return false;
        }

        var validContinuable = (this.isSameEvent(this.prevEvent, event) == false || event.isContinuable());
        if (validContinuable == false)
        {
            return false;
        }

        return true;
    }

    isSameEvent(eventA, eventB)
    {
        if (eventA == null)
        {
            return false;
        }

        if (eventB == null)
        {
            return false;
        }

        var result = (eventA.constructor == eventB.constructor);
        return result;
    }
}