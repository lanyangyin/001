class SelectionTargetItemEvent extends SelectionEvent
{
    constructor(args)
    {
        super();

        this.item = args[0];

        this.targets = [];
        this.cancelObject = new Object();
    }

    setupEvent(survivor, stage)
    {
        this.targets = this.findTargets(survivor);

        super.setupEvent(survivor, stage);

        if (this.targets.length > 0)
        {
            globalSystem.cameraManager.focusSurvivor(survivor);
        }
    }

    exitEvent(survivor, stage)
    {
        super.exitEvent(survivor, stage);

        if (this.targets.length > 0)
        {
            globalSystem.cameraManager.focusReset();
        }
    }

    getSelectionEvents(survivor, stage)
    {
        var result = [];
        if (this.item == null)
        {
            return result;
        }

        for (var target of this.targets)
        {
            const targetItem = target;
            switch (this.item.type)
            {
                case "variable":
                    {
                        result.push(new ItemAddVariableEvent([this.item, targetItem]));
                    }
                    break;
                case "addAccessory":
                    {
                        result.push(new ItemAddAccessoryEvent([this.item, targetItem]));
                    }
                    break;
                default:
                    break;
            }
        }
        result.push(this.cancelObject);
        return result;
    }

    getSelectionWords(survivor, stage)
    {
        if (this.targets == null)
        {
            return [];
        }

        var result = [];
        for (var target of this.targets)
        {
            var name = ItemExecutor.getName(target);
            result.push(name);
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
        return "selectionTargetItem";
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
        survivor.speak("selectionTargetItemFailed", []);
    }

    isSkippable(survivor, stage)
    {
        return true;
    }

    findTargets(owner)
    {
        var result = [];
        if (this.item == null)
        {
            return result;
        }

        var items = owner.getItemsById(this.item.arg0);
        for (var item of items)
        {
            var isValid = this.isValidTarget(this.item.type, item);
            if (isValid == false)
            {
                continue;
            }
            result.push(item);
        }
        return result;
    }

    isValidTarget(type, item)
    {
        switch (type)
        {
            case "variable":
                {
                    return true;
                }
            case "addAccessory":
                {
                    if (item.accessory != null)
                    {
                        return false;
                    }
                    if (StringExtension.isValid(item.accessory))
                    {
                        return false;
                    }
                    return true;
                }
            default:
                return false;
        }
    }
}
