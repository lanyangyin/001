class ItemGetCollectionEvent extends Event
{
    constructor(args)
    {
        super("itemGetCollection", 2, 1);

        this.args = args;
        this.item = null;
        this.success = false;
    }

    setupEvent(survivor, stage)
    {
        var type = this.args[0];
        var failedItemId = null;
        switch (type)
        {
            case "random":
                {
                    var collectionRatio = Number(this.args[1]);
                    failedItemId = this.args[2];
                    var random = Random.range(100) / 100.0;
                    if (random < collectionRatio)
                    {
                        this.item = this.getRandomCollectionItem();
                        this.success = true;
                    }
                }
                break;
            case "id":
                {
                    var id = this.args[1];
                    this.item = this.getCollectionItem(id);
                    this.success = true;
                }
                break;
            case "failed":
                {
                    failedItemId = this.args[1];
                    this.item = null;
                    this.success = false;
                }
            default:
                break;
        }

        if (this.item == null)
        {
            this.item = this.getFailedItem(failedItemId);
            this.success = false;
        }

        if (this.item != null)
        {
            if (this.success)
            {
                this.speakGetCollection(survivor);
            }
            else
            {
                this.speakGetFailedItem(survivor);
            }

            globalSystem.houseManager.pushItem(this.item, false);
            survivor.inventory.pushTemporary(this.item);
        }
    }

    getRandomCollectionItem()
    {
        var list = globalSystem.itemData.getDatasByWhere((item) =>
        {
            if (item.tag != "collection")
            {
                return false;
            }
            return true;
        });

        var list = Random.shuffle(list);
        var correct = [];
        for (var item of list)
        {
            // すでに所持しているなら無効
            var already = globalSystem.houseManager.hasItemById(item.id);
            if (already)
            {
                continue;
            }

            correct.push(item);
        }

        if (correct.length == 0)
        {
            return null;
        }

        var result = correct[0];
        return result;
    }

    getFailedItem(id)
    {
        var result = globalSystem.itemData.getDataById(id);
        return result;
    }

    getCollectionItem(id)
    {
        var result = globalSystem.itemData.getDataById(id);
        return result;
    }

    speakGetCollection(survivor)
    {
        if (this.item == null)
        {
            return;
        }
        survivor.speakWithArg("itemGetLater", "collection", [this.item.name]);
        SurvivorCallHandler.registerPost(this);
    }

    speakGetFailedItem(survivor)
    {
        if (this.item == null)
        {
            return;
        }
        survivor.speak("intoPocket", [this.item.name]);
        SurvivorCallHandler.registerHas(this.item.name);
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
