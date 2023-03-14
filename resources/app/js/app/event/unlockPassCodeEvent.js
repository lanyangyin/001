class UnlockPassCodeEvent extends Event
{
    constructor(arg)
    {
        super("unlockPassCode", 0, 1);

        this.results = [arg[0], arg[1], arg[2]];
        this.items = [];
    }

    static get passCodeItemType()
    {
        return "passCode";
    }

    setupEvent(survivor, stage)
    {
        globalSystem.survivorManager.lock(survivor);

        this.items = [];
        for (var s of globalSystem.survivorManager.survivors)
        {
            var items = s.inventory.getItemsByType(UnlockPassCodeEvent.passCodeItemType);
            for (var item of items)
            {
                var data = { item: item, owner: s };
                this.items.push(data);
            }
        }
        {
            var items = globalSystem.houseManager.getItemsByType(UnlockPassCodeEvent.passCodeItemType);
            for (var item of items)
            {
                var data = { item: item, owner: globalSystem.houseManager };
                this.items.push(data);
            }
        }

        if (this.items.length == 0)
        {
            survivor.speak("nothing", []);
            return;
        }

        globalSystem.cameraManager.focusSurvivor(survivor);
        survivor.speak("lockedPassCode", []);
    }

    executeEvent(survivor, stage)
    {
        if (this.items.length == 0)
        {
            return true;
        }

        globalSystem.uiManager.textLine[survivor.index].setState(TextLine.state.waiting);

        var input = globalSystem.uiManager.textInput[survivor.index].getConverted();
        var text = globalSystem.uiManager.textInput[survivor.index].text;
        if (StringExtension.isNullOrEmpty(input))
        {
            return false;
        }

        globalSystem.uiManager.textLine[survivor.index].writeInput(text);
        globalSystem.uiManager.textInput[survivor.index].reset();

        var used = null;
        for (var data of this.items)
        {
            if (data.item == null)
            {
                continue;
            }
            if (data.item.variable == input)
            {
                used = data;
                break;
            }
        }

        if (used != null)
        {
            used.owner.removeItem(used.item);
            survivor.speak("successPassCode", []);
            this.insertEvent(survivor);
        }
        else
        {
            survivor.speak("failedPassCode", []);
        }
        return true;
    }

    exitEvent(survivor, stage)
    {
        globalSystem.survivorManager.unlock(survivor);

        if (this.items.length == 0)
        {
            return;
        }

        globalSystem.cameraManager.focusReset();
    }

    insertEvent(survivor)
    {
        var eventType = this.selectResult();
        if (eventType == null)
        {
            return;
        }

        var event = EventGenerator.generateById(eventType);
        if (event == null)
        {
            return;
        }

        survivor.insertEvent(event, Event.executeType.event);
    }

    selectResult()
    {
        for (var event of this.results)
        {
            var rand = Random.range(2);
            if (rand == 0)
            {
                return event;
            }
        }

        return this.results[0];
    }
}
