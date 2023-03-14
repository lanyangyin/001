class ItemGetMemoryEvent extends Event
{
    constructor(arg)
    {
        super("itemGetMemory", 2, 1);

        this.item = this.selectItem();
        if (this.item == null)
        {
            this.valid = false;
        }
    }

    executeEvent(survivor, stage)
    {
        if (this.item == null)
        {
            survivor.speak("nothing", []);
            return true;
        }

        if (StringExtension.isValid(this.item.arg1))
        {
            survivor.speakWithArg("itemGetLater", this.item.arg1, [this.item.name]);
        }

        globalSystem.houseManager.pushItem(this.item, false);
        survivor.inventory.pushTemporary(this.item);
        SurvivorCallHandler.registerPost(this);

        return true;
    }

    exitEvent(survivor, stage)
    {
        globalSystem.cameraManager.focusReset();
    }

    selectItem()
    {
        var quest = globalSystem.questManager.currentQuest;
        if (quest == null)
        {
            return null;
        }

        var correct = globalSystem.itemData.getDatasByKey("type", "memory");
        if (correct.length == 0)
        {
            return null;
        }

        var date = quest.date;
        var available = [];
        for (var item of correct)
        {
            if (item.arg0 != date)
            {
                continue;
            }
            // すでに所持しているなら無効
            var already = globalSystem.houseManager.hasItemById(item.id);
            if (already)
            {
                continue;
            }
            available.push(item);
        }
        if (available.length == 0)
        {
            return null;
        }

        var index = Random.range(available.length);
        var result = available[index];
        return result;
    }

    getCallWords(survivor, stage)
    {
        if (this.item == null)
        {
            return [];
        }

        var result = [this.item.name];
        return result;
    }
}
