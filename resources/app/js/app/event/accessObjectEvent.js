class AccessObjectEvent extends Event
{
    constructor(type, time, count, callObjectEvent)
    {
        super(type, time, count);
        this.callObjectEvent = callObjectEvent;
        this.object = callObjectEvent.object;
        this.forceRemove = false;
    }

    exit(survivor, stage)
    {
        super.exit(survivor, stage);

        if (this.callObjectEvent != null)
        {
            // オブジェクトが破棄されない設定なら、再セット
            if (this.isRemoveObject() == false)
            {
                var calledStage = stage;
                if (this.callObjectEvent.calledStage != null)
                {
                    calledStage = this.callObjectEvent.calledStage;
                }

                if (calledStage.hasEvent(this.callObjectEvent) == false)
                {
                    calledStage.pushEvent(this.callObjectEvent);
                    SurvivorCallHandler.unregisterHistory(this.callObjectEvent);
                }
            }
        }
    }

    isRemoveObject()
    {
        if (this.forceRemove)
        {
            return true;
        }

        var result = Type.toBoolean(this.object.once);
        return result;
    }

    getCallWords(survivor, stage)
    {
        if (this.object == null)
        {
            return [];
        }
        return [this.object.keyword, this.object.name];
    }
}
