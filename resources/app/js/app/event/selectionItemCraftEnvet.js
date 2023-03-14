class SelectionItemCraftEvent extends SelectionEvent
{
    constructor(args)
    {
        super();

        this.craftType = args[0];
        this.soundId = args[1];
        this.checkType = args[2];
        this.itemId = args[3];
        this.brokenRatio = Number(args[4]);

        this.craftList = [];
        this.cancelObject = new Object();
        this.disabled = false;
    }

    setupEvent(survivor, stage)
    {
        if (this.checkEnabled(survivor) == false)
        {
            this.disabled = true;
            return;
        }

        super.setupEvent(survivor, stage);

        globalSystem.cameraManager.focusSurvivor(survivor);
    }

    executeEvent(survivor, stage)
    {
        if (this.disabled)
        {
            return true;
        }

        return super.executeEvent(survivor, stage);
    }

    exitEvent(survivor, stage)
    {
        if (this.disabled)
        {
            return;
        }

        super.exitEvent(survivor, stage);

        if (this.selectEvent != null && this.selectEvent != this.cancelObject && StringExtension.isValid(this.itemId))
        {
            var item = survivor.getItemById(this.itemId);
            if (item != null)
            {
                var random = Random.range(100) / 100.0;
                if (random < this.brokenRatio)
                {
                    survivor.pushEvent(new ItemBrokenEvent(item), Event.executeType.event);
                }
            }
        }

        globalSystem.cameraManager.focusReset();
    }

    getSelectionEvents(survivor, stage)
    {
        this.craftList = [];
        var craftable = this.findCraftable(survivor);
        craftable = Random.shuffle(craftable);
        for (var i = 0; i < 3; i++)
        {
            if (i >= craftable.length)
            {
                break;
            }
            this.craftList.push(craftable[i]);
        }

        var result = [];
        for (var data of this.craftList)
        {
            result.push(new ItemCraftEvent([data.id, this.soundId]));
        }
        result.push(this.cancelObject);
        return result;
    }

    getSelectionWords(survivor, stage)
    {
        if (this.craftList == null)
        {
            return [];
        }

        var result = [];
        for (var data of this.craftList)
        {
            result.push(data.name);
        }
        result.push("no");
        return result;
    }

    getSelectionText(survivor, stage)
    {
        var result = "";
        var length = this.selectionWords.length - 1;
        for (var i = 0; i < length; i++)
        {
            result += "<button>" + this.selectionWords[i] + "</button>";
            if (i < length - 1)
            {
                result += Terminology.get("selection_or");
            }
        }
        return result;
    }

    getAskSpeakId(survivor, stage)
    {
        return "selectionCraft";
    }

    getSelectedSpeakId(survivor, stage)
    {
        return "selected";
    }

    getMinCount(survivor, stage)
    {
        return 2;
    }

    onEventSelected(survivor, stage, event)
    {
        if (event == this.cancelObject)
        {
            return;
        }
        survivor.insertEvent(event, Event.executeType.event);
    }

    onFailed(survivor, stage)
    {
        survivor.speak("selectionCraftFailed", []);
    }

    isSkippable(survivor, stage)
    {
        return true;
    }

    getProbability(survivor, stage)
    {
        var craftable = this.findCraftable(survivor);
        if (craftable.length < 1)
        {
            return 0;
        }

        return 0.8;
    }

    findCraftable(owner)
    {
        var result = [];
        var count = globalSystem.itemCraftData.getLength(0);
        for (var i = 0; i < count; i++)
        {
            var data = globalSystem.itemCraftData.getDataByIndex(0, i);
            if (data.type != this.craftType)
            {
                continue;
            }
            if (ItemCraft.canCraft(data.id, owner) == false)
            {
                continue;
            }
            result.push(data);
        }
        return result;
    }

    checkEnabled(owner)
    {
        switch (this.checkType)
        {
            case "checkCraftable":
                {
                    var items = this.findCraftable(owner);
                    if (items.length > 0)
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
            case "noCheck":
            default:
                return true;
        }
    }
}