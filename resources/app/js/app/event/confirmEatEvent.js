class ConfirmEatEvent extends ConfirmEvent
{
    constructor(args)
    {
        super("confirmEat", 1, 1);

        this.item = null;
        this.pushed = false;
    }

    get validRatio()
    {
        return 0.3;
    }

    setupEvent(survivor, stage)
    {
        if (stage == null)
        {
            return;
        }

        var ratio = survivor.staminaRatio;
        if (ratio > this.validRatio)
        {
            return;
        }

        var items = [];
        items = items.concat(survivor.inventory.getItemsByType("cooking"));
        items = items.concat(survivor.inventory.getItemsByType("food"));
        if (items.length == 0)
        {
            return;
        }

        var index = Random.range(items.length);
        this.item = items[index];

        super.setupEvent(survivor, stage);
    }

    executeEvent(survivor, stage)
    {
        if (this.item == null)
        {
            return true;
        }

        if (survivor.hasItem(this.item) == false)
        {
            return true;
        }

        return super.executeEvent(survivor, stage);
    }

    exitEvent(survivor, stage)
    {
        super.exitEvent(survivor, stage);

        this.item = null;
    }

    getYesInputs()
    {
        return ["yes", "eat"];
    }

    getNoInputs()
    {
        return ["no"];
    }

    onYes(survivor, stage)
    {
        if (this.item == null)
        {
            return;
        }

        var event = new ItemUseEvent();
        event.callWord = ItemExecutor.getName(this.item);
        survivor.insertEvent(event, Event.executeType.event);
    }

    onNo(survivor, stage)
    {
        /* nop */
    }

    getConfirmSpeakId(survivor, stage)
    {
        return "confirmUseFood";
    }

    getConfirmSpeakArg(survivor, stage)
    {
        if (this.item == null)
        {
            return [];
        }
        return [this.item.name];
    }

    getProbability(survivor, stage)
    {
        var ratio = survivor.staminaRatio;
        if (ratio < this.validRatio)
        {
            if (this.pushed)
            {
                return 0;
            }
            return 0.2;
        }
        else
        {
            this.pushed = false;
            return 0;
        }
    }

    onPushed(survivor, stage)
    {
        super.onPushed(survivor, stage);
        this.pushed = true;
    }

    isContinuable()
    {
        return true;
    }

    isSkippable(survivor, stage)
    {
        return true;
    }
}