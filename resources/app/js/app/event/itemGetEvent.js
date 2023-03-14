class ItemGetEvent extends Event
{
    constructor(arg, speak = true)
    {
        super("itemGet", 2, 1);

        this.item = null;
        this.sound = "search00";
        this.speak = speak;
        this.preSpeakType = arg[0];
        this.lotteryType = arg[1];
        this.lotteryArgs = [arg[2], arg[3], arg[4]];
    }

    setupEvent(survivor, stage)
    {
        switch (this.lotteryType)
        {
            case "rarity":
                {
                    if (stage == null)
                    {
                        break;
                    }
                    var additionlRarity = parseInt(this.lotteryArgs[0]);
                    var rarity = parseInt(stage.eventRarity) + additionlRarity;
                    this.item = globalSystem.itemData.getRandom(rarity, stage);
                }
                break;
            case "type":
                {
                    if (stage == null)
                    {
                        break;
                    }
                    var type = this.lotteryArgs[0];
                    var rarity = parseInt(stage.eventRarity);
                    this.item = globalSystem.itemData.getRandomByType(type, rarity, stage);
                }
                break;
            case "tag":
                {
                    if (stage == null)
                    {
                        break;
                    }
                    var tags = [];
                    for (var arg of this.lotteryArgs)
                    {
                        if (StringExtension.isValid(arg))
                        {
                            tags.push(arg);
                        }
                    }
                    var rarity = parseInt(stage.eventRarity);
                    this.item = globalSystem.itemData.getRandomByTags(tags, rarity, stage);
                }
                break;
            case "id":
                {
                    var id = this.lotteryArgs[0];
                    this.item = globalSystem.itemData.getDataById(id);
                }
                break;
            default:
                break;
        }
        if (this.item == null)
        {
            return;
        }
    }

    executeEvent(survivor, stage)
    {
        if (this.item == null)
        {
            survivor.speak("nothing", []);
            return true;
        }

        if (this.speak && StringExtension.isValid(this.preSpeakType))
        {
            survivor.speak(this.preSpeakType, [this.item.name]);
        }

        var pushed = survivor.pushItem(this.item);
        if (pushed)
        {
            survivor.inventory.pushTemporary(this.item);
            survivor.speak(this.type, [this.item.name]);

            // 武器/防具の場合、現在装備がなければ装備
            if (survivor.weapon == null && this.item.type == "weapon")
            {
                ItemExecutor.execute(this.item, survivor);
            }
            else if (survivor.armor == null && this.item.type == "armor")
            {
                ItemExecutor.execute(this.item, survivor);
            }
        }
        else
        {
            survivor.insertEvent(new ItemThrowEvent(this.item, "itemCountMax"), Event.executeType.event);
        }
        return true;
    }

    exitEvent(survivor, stage)
    {
        globalSystem.cameraManager.focusReset();
    }
}
