class ItemUseEvent extends Event
{
    constructor()
    {
        super("itemUse", 0, -1);
    }

    setupEvent(survivor, stage)
    {
        globalSystem.cameraManager.focusSurvivor(survivor);
    }

    executeEvent(survivor, stage)
    {
        ItemUseEvent.useItemByName(survivor, this.callWord);
        return true;
    }

    getCallWords(survivor, stage)
    {
        var result = [];
        for (var item of survivor.inventory.list)
        {
            result.push(ItemExecutor.getName(item));
        }
        for (var item of survivor.inventory.list)
        {
            result.push(item.name);
        }
        return result;
    }

    static isUseable(survivor, name)
    {
        var item = survivor.getItemByName(name);
        var result = (item != null);
        return result;
    }

    static useItemByName(survivor, name, whileEvent = false)
    {
        var item = survivor.getItemByName(name);
        if (item == null)
        {
            return;
        }

        ItemUseEvent.useItem(survivor, item, whileEvent);
    }

    static useItem(survivor, item, whileEvent = false)
    {
        var result = ItemExecutor.execute(item, survivor);
        if (result == ItemExecutor.type.unuse)
        {
            switch (item.type)
            {
                case "weapon":
                case "armor":
                    {
                        if (whileEvent == false)
                        {
                            var unequip = new ConfirmUnequipEvent([item]);
                            survivor.insertEvent(unequip, Event.executeType.event);
                        }
                        else
                        {
                            survivor.speak("itemUnuseable_equip", [item.name]);
                        }
                    }
                    break;
                case "tool":
                    {
                        survivor.speak("itemUnuseable_tool", [item.name]);
                    }
                    break;
                case "food":
                    {
                        survivor.speak("itemUnuseable_food", [item.name]);
                    }
                    break;
                default:
                    {
                        survivor.speak("itemUnuseable", [item.name]);
                    }
                    break;
            }

            survivor.applyCostume();

            return true;
        }

        survivor.applyCostume();

        if (StringExtension.isValid(item.speak))
        {
            survivor.speak(item.speak, [item.name]);
        }
        if (result == ItemExecutor.type.use)
        {
            survivor.removeItem(item);
        }
        return true;
    }
}
