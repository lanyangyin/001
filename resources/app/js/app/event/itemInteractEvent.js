class ItemInteractEvent extends AccessObjectEvent
{
    constructor(survivor, object, callObjectEvent)
    {
        super("itemInteract", 0, -1, callObjectEvent);
        this.item = this.getToolItem(survivor, object);
        this.object = object;
        this.resultEvent = this.getResultEvent();
    }

    executeEvent(survivor, stage)
    {
        if (this.resultEvent == null)
        {
            survivor.speak("itemInteractFailed", []);
            return true;
        }

        var speakId = this.item.arg2;
        if (StringExtension.isValid(speakId))
        {
            survivor.speak(speakId, [this.item.name, this.object.keyword]);
        }

        var breakRatio = Number(this.item.arg1);
        if (breakRatio >= 1)
        {
            survivor.removeItem(this.item);
        }
        else if (breakRatio > 0)
        {
            var random = Random.range(100) / 100.0;
            if (random < breakRatio)
            {
                survivor.insertEvent(new ItemBrokenEvent(this.item), Event.executeType.event);
            }
        }

        survivor.insertEvent(this.resultEvent, Event.executeType.event);

        return true;
    }

    getToolItem(survivor, object)
    {
        if (survivor == null)
        {
            return null;
        }
        if (object == null)
        {
            return null;
        }

        var tools = survivor.getItemsByType("tool");
        for (var tool of tools)
        {
            for (var tag of object.interactTags)
            {
                if (StringExtension.isNullOrEmpty(tag))
                {
                    continue;
                }
                if (tag == tool.arg0)
                {
                    return tool;
                }
            }
        }
        return null;
    }

    getResultEvent()
    {
        if (this.item == null)
        {
            return null;
        }
        if (this.object == null)
        {
            return null;
        }

        var itemInteractType = this.item.arg0;
        var interactIndex = -1;
        for (var i = 0; i < this.object.interactTags.length; i++)
        {
            var tag = this.object.interactTags[i];
            if (StringExtension.isNullOrEmpty(tag))
            {
                continue;
            }
            if (tag == itemInteractType)
            {
                interactIndex = i;
                break;
            }
        }

        if (interactIndex == -1)
        {
            return null;
        }

        if (interactIndex >= this.object.interactEvents.length)
        {
            return null;
        }

        var eventId = this.object.interactEvents[interactIndex];
        var event = EventGenerator.generateById(eventId);
        if (event == null)
        {
            return null;
        }

        return event;
    }

    isValid()
    {
        var result = (this.resultEvent != null);
        return result;
    }

    isRemoveObject()
    {
        return true;
    }
}
