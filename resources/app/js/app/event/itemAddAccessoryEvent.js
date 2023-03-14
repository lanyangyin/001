class ItemAddAccessoryEvent extends Event
{
    constructor(args)
    {
        super("itemAddAccessory", 2, 1);

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
        var accessory = globalSystem.itemAccessoryData.getDataById(item.arg1);
        if (accessory == null)
        {
            return false;
        }
        var result = ItemAddAccessoryEvent.addAccessory(accessory, target);
        globalSystem.soundManager.playSe(item.utilizeSound);
        if (owner != null)
        {
            owner.removeItem(item);
        }
        return result;
    }

    static addAccessory(accessory, target)
    {
        if (accessory == null)
        {
            return false;
        }
        if (target == null)
        {
            return false;
        }
        if (target.accessory != null)
        {
            return false;
        }

        target.accessory = accessory;
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

        var result = ItemAddAccessoryEvent.useItem(this.item, this.targetItem, survivor);
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
