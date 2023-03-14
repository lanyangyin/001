class ConfirmItemExchangeEvent extends ConfirmEvent
{
    constructor(args)
    {
        super("confirmItemExchange", 1, 1);

        this.itemTag = args[0];
        this.item = null;
        this.survivorItem = null;
    }

    setupEvent(survivor, stage)
    {
        var rarity = -1;
        var stageType = null;
        if (stage != null)
        {
            rarity = parseInt(stage.eventRarity);
            stageType = stage.describe;
        }

        this.item = globalSystem.itemData.getRandomByTags([this.itemTag], rarity, stage);

        var list = survivor.inventory.getItems();
        if (list.length == 0)
        {
            return;
        }

        list = Random.shuffle(list);
        for (var item of list)
        {
            if (item == null)
            {
                continue;
            }
            if (Number(item.data.weight) == 0)
            {
                continue;
            }
            this.survivorItem = item;
            break;
        }

        super.setupEvent(survivor, stage);
    }

    executeEvent(survivor, stage)
    {
        if (this.item == null)
        {
            return true;
        }

        if (this.survivorItem == null)
        {
            return true;
        }

        return super.executeEvent(survivor, stage);
    }

    exitEvent(survivor, stage)
    {

    }

    getYesInputs()
    {
        return ["yes", "exchange"];
    }

    getNoInputs()
    {
        return ["no"];
    }

    onYes(survivor, stage)
    {
        survivor.inventory.removeItemByName(this.survivorItem.name, this.survivorItem.count);
        survivor.pushItem(this.item);
    }

    onNo(survivor, stage)
    {
        /* nop */
    }

    getConfirmSpeakId(survivor, stage)
    {
        return "confirmItemExchange";
    }

    getConfirmSpeakArg(survivor, stage)
    {
        if (this.item == null)
        {
            return [];
        }
        if (this.survivorItem == null)
        {
            return [];
        }
        return [this.item.name, this.survivorItem.data.name];
    }
}