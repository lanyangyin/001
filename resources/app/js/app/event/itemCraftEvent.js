class ItemCraftEvent extends Event
{
    constructor(args)
    {
        super("itemCraft", 2, 1);

        this.craftId = args[0];
        this.sound = args[1];
    }

    setupEvent(survivor, stage)
    {

    }

    executeEvent(survivor, stage)
    {
        if (this.craftId == null)
        {
            return true;
        }

        if (ItemCraft.canCraft(this.craftId, survivor) == false)
        {
            return true;
        }

        var result = ItemCraft.craft(this.craftId, [], survivor);
        if (result != null)
        {
            var data = globalSystem.itemCraftData.getDataById(this.craftId);
            survivor.speak(this.type, [data.name]);
        }

        return true;
    }

    exitEvent(survivor, stage)
    {

    }
}
