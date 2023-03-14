class ItemAddVariableEvent extends Event
{
    constructor(args)
    {
        super("itemAddVariable", 2, 1);

        this.item = args[0];
        this.targetItem = args[1];
    }

    static useItem(item, target, owner)
    {
        if (item == null)
        {
            return false;
        }
        if (target == null)
        {
            return false;
        }
        var value = item.arg1;
        if (value == null)
        {
            return false;
        }
        var result = ItemAddVariableEvent.addVariable(value, target);
        globalSystem.soundManager.playSe(item.utilizeSound);
        if (owner != null)
        {
            owner.removeItem(item);
        }
        return result;
    }

    static addVariable(value, target)
    {
        if (value == null)
        {
            return false;
        }
        if (target == null)
        {
            return false;
        }

        switch (value)
        {
            case "add5":
                {
                    target.variable = parseInt(target.variable) + 5;
                }
                break;
            case "add10":
                {
                    target.variable = parseInt(target.variable) + 10;
                }
                break;
            default:
                break;
        }
        return true;
    }

    setupEvent(survivor, stage)
    {

    }

    executeEvent(survivor, stage)
    {
        if (this.item == null)
        {
            return true;
        }
        if (this.targetItem == null)
        {
            return true;
        }

        var result = ItemAddVariableEvent.useItem(this.item, this.targetItem, survivor);
        if (result)
        {
            survivor.speak(this.type, [this.targetItem.name, this.item.name]);
        }

        return true;
    }

    exitEvent(survivor, stage)
    {

    }
}
