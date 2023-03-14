class ItemGetBonusEvent extends Event
{
    constructor(args)
    {
        super("itemGetBonus", 2, 1);

        this.speakId = args[0];
        this.item = null;
    }

    static get bonusType()
    {
        var result =
            [
                "collection",
                "normal",
            ];
        return result;
    }

    setupEvent(survivor, stage)
    {
        var types = ItemGetBonusEvent.bonusType;
        var index = Random.range(types.length);
        var type = types[index];

        this.item = this.getRandomBonusItem(type);
        if (this.item == null)
        {
            return;
        }

        survivor.speak("itemGetBonus", [this.item.name]);
        globalSystem.houseManager.pushItem(this.item, false);

        survivor.speak(this.speakId, []);
    }

    exitEvent(survivor, stage)
    {
        if (this.item != null && this.item.type == "scenario")
        {
            globalSystem.questManager.endQuest(true);
            var result = ItemExecutor.apply(this.item, survivor);
            if (result == ItemExecutor.applyResult.unuse)
            {
                globalSystem.flowManager.setFlow(new GatewayFlow());
            }
        }
    }

    getRandomBonusItem(type)
    {
        var data = globalSystem.bonusData.getRandomByType(type);
        if (data == null)
        {
            return null;
        }

        var item = globalSystem.itemData.getDataById(data.item);
        return item;
    }
}
