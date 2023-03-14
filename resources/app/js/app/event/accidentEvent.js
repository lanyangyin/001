class AccidentEvent extends Event
{
    constructor(args)
    {
        super("accident", 0, 1);

        this.accidentType = args[0];
        this.data = null;
    }

    get tags()
    {
        return ["danger"];
    }

    setupEvent(survivor, stage)
    {
        var list = null;
        if (StringExtension.isValid(this.accidentType))
        {
            list = globalSystem.accidentData.getDatasByKey("type", this.accidentType);
        }
        else
        {
            var reality = parseInt(stage.eventRarity);
            list = globalSystem.accidentData.getDatasByWhere((item) =>
            {
                var itemReality = parseInt(item.reality);
                if (itemReality == -1)
                {
                    return false;
                }
                return itemReality <= reality;
            });
        }

        if (list == null)
        {
            return;
        }

        var index = Random.range(list.length);
        this.data = list[index];

        if (this.data != null)
        {
            globalSystem.cameraManager.focusSurvivor(survivor);
        }
    }

    executeEvent(survivor, stage)
    {
        if (this.data == null)
        {
            return true;
        }

        switch (this.data.executeType)
        {
            case "damage":
                {
                    this.speak(survivor, []);
                    var damage = parseInt(this.data.executeArg);
                    survivor.damage(damage, null, false);
                }
                break;
            case "heal":
                {
                    this.speak(survivor, []);
                    var heal = parseInt(this.data.executeArg);
                    survivor.heal(heal);
                }
                break;
            case "lostItem":
                {
                    var items = [];
                    for (var item of survivor.inventory.list)
                    {
                        if (item == survivor.weapon)
                        {
                            continue;
                        }
                        if (item == survivor.armor)
                        {
                            continue;
                        }
                        if (parseInt(item.rarity) >= 100)
                        {
                            continue;
                        }
                        if (Type.toBoolean(item.lost) == false)
                        {
                            continue;
                        }
                        items.push(item);
                    }
                    if (items.length == 0)
                    {
                        return true;
                    }
                    var index = Random.range(items.length);
                    var lostItem = items[index];
                    var name = lostItem.name;
                    this.speak(survivor, [name]);
                    survivor.lostItem(lostItem);
                }
                break;
            default:
                break;
        }

        globalSystem.soundManager.playSe(this.data.sound);

        return true;
    }

    speak(survivor, param)
    {
        survivor.speakWithArg(this.type, this.data.speakArg, param);
    }

    getUseStamina()
    {
        return 2;
    }
}