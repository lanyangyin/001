class ItemBrokenEvent extends Event
{
    constructor(item)
    {
        super("itemBroken", 0, 1);
        this.item = item;
    }

    setupEvent(survivor, stage)
    {
        survivor.speak("itemBroken", [this.item.name]);
        survivor.removeItem(this.item);
    }

    executeEvent(survivor, stage)
    {
        return true;
    }
}
