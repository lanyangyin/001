class ItemAccessory
{
    constructor()
    {
        /* nop */
    }

    static onExecute(item, owner)
    {
        if (item.accessory == null)
        {
            return;
        }

        ItemAccessory.execute(item.accessory.buff, item.accessory.buffArgs, item, owner);
        ItemAccessory.execute(item.accessory.debuff, item.accessory.debuffArgs, item, owner);
    }

    static onApply(item, owner)
    {
        if (item.accessory == null)
        {
            return;
        }

        ItemAccessory.apply(item.accessory.buff, item.accessory.buffArgs, item, owner);
        ItemAccessory.apply(item.accessory.debuff, item.accessory.debuffArgs, item, owner);
    }

    static onApplyItem(item, owner)
    {
        if (item.accessory == null)
        {
            return;
        }

        if (item.accessory.onApplyItem == null)
        {
            return;
        }

        for (var type of item.accessory.onApplyItem)
        {
            if (StringExtension.isNullOrEmpty(type))
            {
                continue;
            }
            ItemAccessory.apply(type, [], item, owner);
        }
    }

    static execute(type, args, item, owner)
    {
        /* nop */
    }

    static apply(type, args, item, owner)
    {
        switch (type)
        {
            case "multiplyArg0":
                {
                    var value = args[0];
                    var itemData = globalSystem.itemData.getDataById(item.id);
                    item.arg0 = parseInt(Number(itemData.arg0) * Number(value));
                }
                break;
            case "overwriteArg1":
                {
                    var value = args[0];
                    item.arg1 = Number(value);
                }
                break;
            case "resetArg0":
                {
                    var itemData = globalSystem.itemData.getDataById(item.id);
                    if (itemData != null)
                    {
                        item.arg0 = itemData.arg0;
                    }
                }
                break;
            case "resetArg1":
                {
                    var itemData = globalSystem.itemData.getDataById(item.id);
                    if (itemData != null)
                    {
                        item.arg1 = itemData.arg1;
                    }
                }
                break;
            case "pushStageEvent":
                {
                    if (owner != null)
                    {
                        var ratio = Number(args[0]);
                        var eventId = args[1];
                        var random = Random.range(100) / 100.0;
                        if (ratio <= random)
                        {
                            break;
                        }
                        var event = EventGenerator.generateById(eventId);
                        if (event == null)
                        {
                            break;
                        }
                        var stage = owner.currentStage;
                        if (stage == null)
                        {
                            break;
                        }
                        stage.pushEvent(event);
                    }
                }
                break;
            case "damage":
                {
                    if (owner != null)
                    {
                        var damage = Number(args[0]);
                        owner.damage(damage, null, false);
                    }
                }
                break;
            case "decrementId":
                {
                    var id = item.accessory.id;
                    var numbers = StringExtension.toNumbers(id);
                    if (numbers.length > 0)
                    {
                        var number = numbers[numbers.length - 1];
                        var newId = id.replace(number, number - 1);
                        var data = globalSystem.itemAccessoryData.getDataById(newId);
                        if (data != null)
                        {
                            item.accessory = data;
                        }
                    }
                }
                break;
            case "disableAccessory":
                {
                    item.accessory = null;
                }
                break;
            default:
                break;
        }
    }

    static addAccessory(item)
    {
        if (item.accessory == null)
        {
            return;
        }

        if (item.accessory.id != null)
        {
            return;
        }

        if (Random.range(3) != 0)
        {
            item.accessory = null;
            return;
        }

        var accessory = globalSystem.itemAccessoryData.getRandomByType(item.accessory);
        item.accessory = accessory;
    }

}