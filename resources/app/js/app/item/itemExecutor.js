class ItemExecutor
{
    constructor()
    {
        /* nop */
    }

    static get type()
    {
        var type =
        {
            unuse: -1,
            use: 0,
            equip: 1,
            read: 2,
            interact: 3,
            event: 4,
        };
        return type;
    }

    static get applyResult()
    {
        var type =
        {
            unuse: -1,
            use: 0,
            broken: 1,
        };
        return type;
    }

    static execute(item, target)
    {
        return ItemExecutor.executeItem(item, target, true);
    }

    static getUseType(item)
    {
        var result = ItemExecutor.executeItem(item, null, false);
        return result;
    }

    static isUseable(item)
    {
        var type = ItemExecutor.getUseType(item);
        var result = (type != ItemExecutor.type.unuse);
        return result;
    }

    static isLostable(item)
    {
        if (item == null)
        {
            return false;
        }
        var result = Type.toBoolean(item.lost);
        return result;
    }

    static executeItem(item, target, use)
    {
        // 変数初期化
        ItemExecutor.init(item);

        // アクセサリ反映
        ItemAccessory.onExecute(item, target);

        var result = ItemExecutor.type.unuse;

        // アイテム使用
        switch (item.type)
        {
            case "heal":
                if (use)
                {
                    target.heal(Number(item.arg0));
                }
                result = ItemExecutor.type.use;
                break;
            case "food":
                if (use)
                {
                    target.recoverStamina(Number(item.arg0));
                }
                result = ItemExecutor.type.use;
                break;
            case "cooking":
                if (use)
                {
                    var ratio = target.isFoodRatio(item.arg2);
                    if (ratio > 1)
                    {
                        target.speak("eat_favorite", [item.name]);
                    }
                    else if (ratio < 1)
                    {
                        target.speak("eat_dislike", [item.name]);
                    }
                    else
                    {
                        target.speak("eat", [item.name]);
                    }
                    target.heal(Number(item.arg0) * ratio);
                    target.recoverStamina(Number(item.arg1));
                }
                result = ItemExecutor.type.use;
                break;
            case "weapon":
                result = ItemExecutor.type.equip;
                if (use)
                {
                    var equip = target.equipWeapon(item);
                    if (equip == false)
                    {
                        result = ItemExecutor.type.unuse;
                    }
                }
                break;
            case "armor":
                result = ItemExecutor.type.equip;
                if (use)
                {
                    var equip = target.equipArmor(item);
                    if (equip == false)
                    {
                        result = ItemExecutor.type.unuse;
                    }
                }
                break;
            case "attack":
                if (use)
                {
                    result = ItemExecutor.type.unuse;
                    for (var survivor of globalSystem.survivorManager.survivors)
                    {
                        var event = survivor.currentEvent;
                        if (event != null && event instanceof BattleEvent)
                        {
                            event.attackEnemy(target, Number(item.arg0));
                            result = ItemExecutor.type.use;
                            break;
                        }
                    }
                }
                else
                {
                    result = ItemExecutor.type.unuse;
                }
                break;
            case "reserveEnemyAttack":
                if (use)
                {
                    result = ItemExecutor.type.unuse;
                    for (var survivor of globalSystem.survivorManager.survivors)
                    {
                        var event = survivor.currentEvent;
                        if (event != null && event instanceof BattleEvent)
                        {
                            var attacks = item.arg0.split("/");
                            var enemys = event.getEnemeys();
                            for (var enemy of enemys)
                            {
                                enemy.clearReservedAttacks();
                                for (var attack of attacks)
                                {
                                    enemy.reserveAttack(attack);
                                }
                            }
                            result = ItemExecutor.type.use;
                            break;
                        }
                    }
                }
                else
                {
                    result = ItemExecutor.type.unuse;
                }
                break;
            case "event":
                if (use)
                {
                    var useable = true;
                    var locking = globalSystem.survivorManager.locking;
                    if (locking != null && locking == target)
                    {
                        useable = false;
                    }
                    if (useable)
                    {
                        var event = EventGenerator.generateById(item.arg0);
                        if (event == null)
                        {
                            break;
                        }
                        target.insertEvent(event, Event.executeType.event);
                        result = ItemExecutor.type.event;
                    }
                    else
                    {
                        result = ItemExecutor.type.unuse;
                    }
                }
                else
                {
                    result = ItemExecutor.type.event;
                }
                break;
            case "stageOption":
                result = ItemExecutor.type.use;
                if (use)
                {
                    var useable = true;
                    var locking = globalSystem.survivorManager.locking;
                    if (locking != null && locking == target)
                    {
                        useable = false;
                    }
                    if (useable)
                    {
                        if (target.currentStage == null)
                        {
                            break;
                        }
                        var option = Class.getInstance(item.arg0);
                        if (option == null)
                        {
                            break;
                        }
                        target.currentStage.pushOption(option);
                        result = ItemExecutor.type.use;
                    }
                    else
                    {
                        result = ItemExecutor.type.unuse;
                    }
                }
                break;
            case "passCode":
                if (use)
                {
                    var text = item.arg0;
                    text = text.replace("{0}", item.variable);
                    target.speak("read", [text]);
                }
                result = ItemExecutor.type.read;
                break;
            case "skill":
                if (use)
                {
                    target.pushSkill(item.arg0);
                }
                result = ItemExecutor.type.use;
                break;
            case "variable":
            case "addAccessory":
                if (use)
                {
                    var useable = true;
                    var locking = globalSystem.survivorManager.locking;
                    if (locking != null && locking == target)
                    {
                        useable = false;
                    }
                    if (useable)
                    {
                        var event = new SelectionTargetItemEvent([item]);
                        target.insertEvent(event, Event.executeType.event);
                        result = ItemExecutor.type.event;
                    }
                    else
                    {
                        result = ItemExecutor.type.unuse;
                    }
                }
                else
                {
                    result = ItemExecutor.type.event;
                }
                break;
            default:
                break;
        }

        // サウンド再生
        if (use && result != ItemExecutor.type.unuse)
        {
            if (StringExtension.isNullOrEmpty(item.sound) == false)
            {
                globalSystem.soundManager.playSe(item.sound);
            }
        }

        return result;
    }

    static apply(item, owner, used = false, onApply = null)
    {
        return ItemExecutor.applyItem(item, owner, used, onApply);
    }

    static applyItem(item, owner, used, onApply)
    {
        var result = ItemExecutor.applyResult.unuse;
        if (item == null)
        {
            return result;
        }

        // アクセサリ反映
        ItemAccessory.onApply(item, owner);

        // 反映不可
        var applicable = ItemExecutor.isApplicable(item, owner);
        if (applicable == false)
        {
            return result;
        }

        switch (item.type)
        {
            case "weapon":
                {
                    // 弾丸を消費
                    if (StringExtension.isNullOrEmpty(item.arg2) == false)
                    {
                        var ammo = owner.inventory.getItemById(item.arg2);
                        if (ammo != null)
                        {
                            globalSystem.soundManager.playSe(item.utilizeSound);
                            owner.removeItem(ammo);
                            result = ItemExecutor.applyResult.use;
                        }
                    }
                    else
                    {
                        globalSystem.soundManager.playSe(item.utilizeSound);
                        result = ItemExecutor.applyResult.use;
                    }

                    // 武器は一定確率で壊れる
                    var breakRatio = parseFloat(item.arg1);
                    var random = Random.range(100) / 100.0;
                    if (random < breakRatio)
                    {
                        owner.removeItem(item);
                        result = ItemExecutor.applyResult.broken;
                    }
                }
                break;
            case "armor":
                {
                    // 防具は装備しているだけで適応
                    result = ItemExecutor.applyResult.use;

                    // 防具は一定確率で壊れる
                    var breakRatio = parseFloat(item.arg1);
                    var random = Random.range(100) / 100.0;
                    if (random < breakRatio)
                    {
                        owner.removeItem(item);
                        result = ItemExecutor.applyResult.broken;
                    }
                }
                break;
            case "map":
                {
                    if (used)
                    {
                        var index = globalSystem.areaManager.currentIndex;
                        var location = globalSystem.areaManager.getCurrentLocation();
                        var startLocation = globalSystem.questManager.startLocation;
                        var isCorrectStart = (startLocation == item.variable || StringExtension.isNullOrEmpty(item.variable));
                        if (isCorrectStart && item.arg0 == location && (Number(item.arg1) - 1) == index)
                        {
                            var locationData = globalSystem.locationData.getDataById(item.arg0);
                            if (locationData != null)
                            {
                                owner.speak("arrivedMapLocation", [locationData.name]);
                                owner.removeItem(item);
                                result = ItemExecutor.applyResult.use;
                            }
                        }
                    }
                    else
                    {
                        var location = globalSystem.questManager.startLocation;
                        if (location == item.variable || StringExtension.isNullOrEmpty(item.variable))
                        {
                            globalSystem.areaManager.pushOverwriteLocation(Number(item.arg1) - 1, item.arg0);
                        }
                    }
                }
                break;
            case "photo":
                {
                    var count = Number(item.variable);
                    if (used)
                    {
                        var index = globalSystem.areaManager.currentIndex;
                        var location = globalSystem.areaManager.getCurrentLocation();
                        if (item.arg0 == location && count == index)
                        {
                            var locationData = globalSystem.locationData.getDataById(item.arg0);
                            if (locationData != null)
                            {
                                owner.speak("arrivedPhotoLocation", [locationData.name]);
                                owner.removeItem(item);
                                result = ItemExecutor.applyResult.use;
                            }
                        }
                    }
                    else
                    {
                        var areaFinished = globalSystem.areaManager.finished;
                        if (areaFinished)
                        {
                            var advance = globalSystem.areaManager.getIndex() + 1;
                            var newCount = count - advance;
                            if (newCount <= 0)
                            {
                                newCount = 1;
                            }
                            item.variable = newCount;
                        }
                        else
                        {
                            if (count <= 0)
                            {
                                count = 1;
                            }
                            globalSystem.areaManager.pushOverwriteLocation(count, item.arg0);
                        }
                    }
                }
                break;
            case "eventArrivedLocation":
                {
                    var count = Number(item.variable);
                    if (used)
                    {
                        var index = globalSystem.areaManager.currentIndex;
                        if (count == index)
                        {
                            var event = EventGenerator.generateById(item.arg0);
                            if (event != null)
                            {
                                owner.pushEvent(event, Event.executeType.event);
                                owner.removeItem(item);
                                result = ItemExecutor.applyResult.use;
                            }
                        }
                    }
                    else
                    {
                        var areaFinished = globalSystem.areaManager.finished;
                        if (areaFinished)
                        {
                            var advance = globalSystem.areaManager.getIndex() + 1;
                            var newCount = count - advance;
                            if (newCount <= 0)
                            {
                                newCount = 1;
                            }
                            item.variable = newCount;
                        }
                    }
                }
                break;
            case "trap":
                {
                    switch (item.arg0)
                    {
                        case "locationOption":
                            var location = globalSystem.locationManager.location;
                            if (location != null)
                            {
                                var option = Class.getInstance(item.arg1);
                                if (option != null)
                                {
                                    location.pushOption(option);
                                    var name = ItemExecutor.getName(item);
                                    owner.speak("useTrap", [name]);
                                    owner.removeItem(item);
                                    result = ItemExecutor.applyResult.use;
                                }
                            }
                            break;
                        default:
                            break;
                    }
                }
                break;
            case "box":
                {
                    var tag = item.arg0;
                    var count = Number(item.arg1);
                    var items = [];
                    var ids = [];
                    for (var i = 0; i < count; i++)
                    {
                        var pushItem = globalSystem.itemData.getRandomByTags([tag], -1, null);
                        if (pushItem == null)
                        {
                            continue;
                        }
                        items.push(pushItem);
                        globalSystem.houseManager.pushItem(pushItem, false);

                        // 5種類までにする
                        if (ids.indexOf(pushItem.id) == -1)
                        {
                            ids.push(pushItem.id);
                            if (ids.length >= 5)
                            {
                                break;
                            }
                        }
                    }

                    var list = ItemExecutor.getItemNames(items);
                    var dialog = "";
                    for (var info of list)
                    {
                        dialog += `${info.name} x${info.count}<br>`;
                    }

                    globalSystem.uiManager.dialog.addButton(0, Terminology.get("item_toHouse"), () =>
                    {
                        globalSystem.uiManager.dialog.close();
                    });
                    globalSystem.uiManager.dialog.open(dialog);
                    owner.removeItem(item);
                    globalSystem.soundManager.playSe(item.utilizeSound);
                    result = ItemExecutor.applyResult.use;
                }
                break;
            case "variable":
                {
                    var targets = globalSystem.survivorManager.getItemsById(item.arg0);
                    targets = targets.concat(globalSystem.houseManager.getItemsById(item.arg0));
                    if (targets.length > 0)
                    {
                        var names = [];
                        var descriptions = [];
                        for (var i = 0; i < targets.length; i++)
                        {
                            names.push(ItemExecutor.getName(targets[i]));
                            descriptions.push(ItemExecutor.getDescription(targets[i], false, false));
                        }
                        globalSystem.uiManager.dialog.addButton(0, Terminology.get("item_use"), () =>
                        {
                            var index = globalSystem.uiManager.dialog.selectIndex;
                            var target = targets[index];
                            ItemAddVariableEvent.useItem(item, target, owner);
                            globalSystem.uiManager.dialog.close();
                            if (onApply != null)
                            {
                                onApply();
                            }
                        });
                        globalSystem.uiManager.dialog.addCloseButton(1);
                        globalSystem.uiManager.dialog.openSelector(Terminology.get("item_selectTarget"), names, descriptions);
                        result = ItemExecutor.applyResult.use;
                    }
                    else
                    {
                        globalSystem.uiManager.dialog.open(Terminology.get("item_targetNotFound"));
                        result = ItemExecutor.applyResult.unuse;
                    }
                }
                break;
            case "addAccessory":
                {
                    var hasItems = globalSystem.survivorManager.getItemsById(item.arg0);
                    hasItems = hasItems.concat(globalSystem.houseManager.getItemsById(item.arg0));

                    var targets = [];
                    for (var has of hasItems)
                    {
                        if (has.accessory != null)
                        {
                            continue;
                        }
                        if (StringExtension.isValid(has.accessory))
                        {
                            continue;
                        }
                        targets.push(has);
                    }

                    if (targets.length > 0)
                    {
                        var names = [];
                        var descriptions = [];
                        for (var i = 0; i < targets.length; i++)
                        {
                            names.push(ItemExecutor.getName(targets[i]));
                            descriptions.push(ItemExecutor.getDescription(targets[i], false, false));
                        }
                        globalSystem.uiManager.dialog.addButton(0, Terminology.get("item_use"), () =>
                        {
                            var index = globalSystem.uiManager.dialog.selectIndex;
                            var target = targets[index];
                            ItemAddAccessoryEvent.useItem(item, target, owner);
                            globalSystem.uiManager.dialog.close();
                            if (onApply != null)
                            {
                                onApply();
                            }
                        });
                        globalSystem.uiManager.dialog.addCloseButton(1);
                        globalSystem.uiManager.dialog.openSelector(Terminology.get("item_selectTarget"), names, descriptions);
                        result = ItemExecutor.applyResult.use;
                    }
                    else
                    {
                        globalSystem.uiManager.dialog.open(Terminology.get("item_targetNotFound"));
                        result = ItemExecutor.applyResult.unuse;
                    }
                }
                break;
            case "dismantle":
                {
                    var targets = [];
                    for (var survivor of globalSystem.survivorManager.survivors)
                    {
                        for (var hasItem of survivor.inventory.list)
                        {
                            const recipes = globalSystem.itemCraftData.getDatasByKey("item", hasItem.id);
                            for (const recipe of recipes)
                            {
                                if (recipe == null)
                                {
                                    continue;
                                }
                                if (recipe.type != item.arg0 && recipe.type != "dismantle")
                                {
                                    continue;
                                }
                                if (Type.toBoolean(recipe.dismantleable) == false)
                                {
                                    continue;
                                }
                                const pushItem = hasItem;
                                const owner = survivor;
                                targets.push({ item: pushItem, owner: owner, recipe: recipe });
                            }
                        }
                    }
                    for (var hasItem of globalSystem.houseManager.items)
                    {
                        const recipes = globalSystem.itemCraftData.getDatasByKey("item", hasItem.id);
                        for (const recipe of recipes)
                        {
                            if (recipe == null)
                            {
                                continue;
                            }
                            if (recipe.type != item.arg0 && recipe.type != "dismantle")
                            {
                                continue;
                            }
                            if (Type.toBoolean(recipe.dismantleable) == false)
                            {
                                continue;
                            }
                            const pushItem = hasItem;
                            const owner = globalSystem.houseManager;
                            targets.push({ item: pushItem, owner: owner, recipe: recipe });
                        }
                    }
                    if (targets.length > 0)
                    {
                        var names = [];
                        var descriptions = [];
                        for (var target of targets)
                        {
                            names.push(ItemExecutor.getName(target.item));
                            descriptions.push(ItemCraft.getMaterialDescription(target.recipe.id));
                        }
                        globalSystem.uiManager.dialog.addButton(0, Terminology.get("item_dismantle"), () =>
                        {
                            var index = globalSystem.uiManager.dialog.selectIndex;
                            var target = targets[index];
                            if (target != null)
                            {
                                for (var i = 0; i < ItemCraft.materialCountMax; i++)
                                {
                                    var field = `material${i}`;
                                    var materialId = target.recipe[field];
                                    if (StringExtension.isNullOrEmpty(materialId))
                                    {
                                        continue;
                                    }
                                    var material = globalSystem.itemData.getDataById(materialId);
                                    if (material == null)
                                    {
                                        continue;
                                    }
                                    globalSystem.houseManager.pushItem(material, false);
                                }
                                target.owner.removeItem(target.item);
                                owner.removeItem(item);
                                globalSystem.soundManager.playSe(item.utilizeSound);
                                globalSystem.uiManager.dialog.close();
                                if (onApply != null)
                                {
                                    onApply();
                                }
                            }
                        });
                        globalSystem.uiManager.dialog.addCloseButton(1);
                        globalSystem.uiManager.dialog.openSelector(Terminology.get("item_selectTarget"), names, descriptions);
                        result = ItemExecutor.applyResult.use;
                    }
                    else
                    {
                        result = ItemExecutor.applyResult.unuse;
                    }
                }
                break;
            case "scenario":
                {
                    var condition = item.arg2;
                    if (StringExtension.isValid(condition))
                    {
                        var finished = globalSystem.scenarioManager.isFinished(condition);
                        if (finished == false)
                        {
                            globalSystem.uiManager.dialog.open(Terminology.get("house_unuseable"));
                            result = ItemExecutor.applyResult.unuse;
                            break;
                        }
                    }
                    var id = item.arg0;
                    var data = globalSystem.scenarioData.getDataById(id);
                    var executed = false;
                    if (data != null)
                    {
                        var conditionValid = ScenarioDataHolder.checkCondition(data);
                        if (conditionValid)
                        {
                            executed = ScenarioExecutor.execute(data, null, "house");
                        }
                    }
                    if (executed)
                    {
                        var remove = Type.toBoolean(item.arg1);
                        if (remove)
                        {
                            owner.removeItem(item);
                        }
                        result = ItemExecutor.applyResult.use;
                    }
                    else
                    {
                        globalSystem.uiManager.dialog.open(Terminology.get("house_unuseable"));
                        result = ItemExecutor.applyResult.unuse;
                    }
                }
                break;
            case "mission":
                {
                    var id = item.arg3;
                    var scenario = globalSystem.scenarioData.getDataById(id);
                    var executed = false;
                    if (scenario != null)
                    {
                        var conditionValid = ScenarioDataHolder.checkCondition(scenario);
                        if (conditionValid)
                        {
                            var removeSuccess = false;
                            var request = item.variable;
                            var count = parseInt(item.arg0);
                            var houseRemoved = globalSystem.houseManager.removeItemById(request, count);
                            if (houseRemoved.length < count)
                            {
                                count -= houseRemoved.length;
                                var survivorRemoved = globalSystem.survivorManager.removeItemById(request, count);
                                removeSuccess = (survivorRemoved.length >= count);
                            }
                            else
                            {
                                removeSuccess = true;
                            }
                            if (removeSuccess)
                            {
                                var reward = globalSystem.itemData.getRandomByType(item.arg1, -1, null);
                                if (reward != null)
                                {
                                    var count = Number(item.arg2);
                                    for (var i = 0; i < count; i++)
                                    {
                                        var rewardItem = globalSystem.itemData.getDataById(reward.id);
                                        globalSystem.houseManager.pushItem(rewardItem, false);
                                    }

                                    var requestItem = globalSystem.itemData.getDataById(request);
                                    if (requestItem != null)
                                    {
                                        globalSystem.questManager.setTemporaryVariable("requestItem", requestItem.name);
                                    }
                                    if (reward != null)
                                    {
                                        globalSystem.questManager.setTemporaryVariable("rewardItem", reward.name);
                                        globalSystem.questManager.setTemporaryVariable("rewardItemCount", count);
                                    }
                                    executed = ScenarioExecutor.execute(scenario, null, "house");
                                }
                            }
                        }
                    }
                    if (executed)
                    {
                        owner.removeItem(item);
                        result = ItemExecutor.applyResult.use;
                    }
                    else
                    {
                        globalSystem.uiManager.dialog.open(Terminology.get("house_unuseable"));
                        result = ItemExecutor.applyResult.unuse;
                    }
                }
                break;
            case "quest":
                {
                    var id = item.arg0;
                    var quest = globalSystem.questData.getDataById(id);
                    if (quest != null)
                    {
                        globalSystem.questManager.setupQuest(quest, null, quest.area, item.variable);
                        globalSystem.flowManager.setFlow(new QuestFlow());
                        globalSystem.soundManager.pauseBgm();
                    }
                    owner.removeItem(item);
                    result = ItemExecutor.applyResult.use;
                }
            default:
                break;
        }

        if (result == ItemExecutor.applyResult.use)
        {
            ItemAccessory.onApplyItem(item, owner);
        }

        return result;
    }

    static isApplicable(item, owner)
    {
        var result = true;

        switch (item.type)
        {
            case "weapon":
                {
                    if (StringExtension.isNullOrEmpty(item.arg2) == false)
                    {
                        var ammo = owner.inventory.getItemById(item.arg2);
                        result = (ammo != null);
                    }
                }
                break;
            default:
                break;
        }

        return result;
    }

    static init(item)
    {
        ItemExecutor.initVarialbe(item);
        ItemAccessory.addAccessory(item);
    }

    static getName(item, preview = false)
    {
        // 変数初期化
        if (preview == false)
        {
            ItemExecutor.init(item);
        }

        var result = item.name;

        switch (item.type)
        {
            case "weapon":
            case "armor":
                {
                    if (preview == false)
                    {
                        var variable = Number(item.variable);
                        if (variable > 0)
                        {
                            result = `${result} +${item.variable}`;
                        }
                    }
                }
                break;
            case "map":
                {
                    if (preview == false)
                    {
                        var location = globalSystem.locationData.getDataById(item.variable);
                        if (location != null)
                        {
                            result = `${result}（${location.name}）`;
                            result = StringExtension.clamp(result, GlobalParam.get("itemNameLengthMax"));
                        }
                    }
                }
                break;
            case "passCode":
                {
                    if (preview == false)
                    {
                        var number = item.variable;
                        result = `${result}（${number}）`;
                    }
                }
                break;
            case "mission":
                {
                    if (preview == false)
                    {
                        var request = globalSystem.itemData.getDataById(item.variable);
                        if (request != null)
                        {
                            result = `${result}（${request.name} x${item.arg0}）`;
                            result = StringExtension.clamp(result, GlobalParam.get("itemNameLengthMax"));
                        }
                    }
                }
                break;
            case "quest":
                {
                    if (preview == false)
                    {
                        var location = globalSystem.locationData.getDataById(item.variable);
                        if (location != null)
                        {
                            result = `${result}（${location.name}）`;
                            result = StringExtension.clamp(result, GlobalParam.get("itemNameLengthMax"));
                        }
                    }
                }
                break;
            case "record":
                {
                    if (preview == false)
                    {
                        var args = item.variable.split("/");
                        var count = args[args.length - 1];
                        result = `${result}（${count}${Terminology.get("passage")}）`;
                    }
                }
                break;
            case "music":
                {
                    var sound = globalSystem.soundData.getDataById(item.arg0);
                    if (sound != null)
                    {
                        result = `${result}（${sound.name}）`;
                        result = StringExtension.clamp(result, GlobalParam.get("itemNameLengthMax"));
                    }
                }
                break;
            case "eventArrivedLocation":
                {
                    var arg = item.arg0.replace("itemGetFindByLetter", "");
                    var reward = Terminology.get(`letterReward_${arg}`);
                    if (reward != null)
                    {
                        result = `${result}（${reward}）`;
                        result = StringExtension.clamp(result, GlobalParam.get("itemNameLengthMax"));
                    }
                }
                break;
            default:
                break;
        }

        if (preview == false)
        {
            if (item.accessory != null && item.accessory.name != null)
            {
                result = `${item.accessory.name}${result}`;
            }
        }

        return result;
    }

    static getDescription(item, preview = false, addName = true)
    {
        var name = ItemExecutor.getName(item, preview);
        var description = item.description;

        if (preview == false)
        {
            if (item.accessory != null && item.accessory.name != null)
            {
                result = `${item.accessory.name}${result}`;
            }
            ItemAccessory.onApply(item, null);
        }

        switch (item.type)
        {
            case "weapon":
            case "armor":
                {
                    description = description.replace("{0}", item.arg0);
                    if (preview)
                    {
                        description = description.replace("{1}", Terminology.get("unknown_question"));
                    }
                    else
                    {
                        description = description.replace("{1}", item.variable);
                    }
                }
                break;
            case "cooking":
                {
                    description = description.replace("{0}", item.arg0);
                    description = description.replace("{1}", item.arg1);
                }
                break;
            case "inventory":
                {
                    var count = Number(item.arg0);
                    description = description.replace("{0}", count);
                }
                break;
            case "map":
                {
                    var targetLocation = globalSystem.locationData.getDataById(item.arg0);
                    if (targetLocation != null)
                    {
                        description = description.replace("{0}", targetLocation.name);
                        description = description.replace("{3}", targetLocation.name);
                    }
                    else
                    {
                        description = description.replace("{0}", Terminology.get("unknown_question"));
                        description = description.replace("{3}", Terminology.get("unknown_question"));
                    }
                    var startLocation = globalSystem.locationData.getDataById(item.variable);
                    if (startLocation != null && preview == false)
                    {
                        description = description.replace("{1}", startLocation.name);
                    }
                    else
                    {
                        description = description.replace("{1}", Terminology.get("unknown_question"));
                    }
                    description = description.replace("{2}", item.arg1);
                }
                break;
            case "photo":
                {
                    var targetLocation = globalSystem.locationData.getDataById(item.arg0);
                    if (targetLocation != null)
                    {
                        description = description.replace("{0}", targetLocation.name);
                    }
                    else
                    {
                        description = description.replace("{0}", Terminology.get("unknown_question"));
                    }
                    var count = Number(item.variable);
                    if (count != null)
                    {
                        description = description.replace("{1}", count);
                    }
                    else
                    {
                        description = description.replace("{1}", Terminology.get("unknown_question"));
                    }
                }
                break;
            case "memory":
                {
                    var date = item.arg0;
                    var dateData = globalSystem.exprolerData.getDataByDate(date);
                    if (dateData != null)
                    {
                        description = description.replace("{0}", dateData.name);
                    }
                }
                break;
            case "mission":
                {
                    var request = globalSystem.itemData.getDataById(item.variable);
                    if (request != null)
                    {
                        description = description.replace("{0}", request.name);
                    }
                    else
                    {
                        description = description.replace("{0}", Terminology.get("unknown_question"));
                    }
                    description = description.replace("{1}", parseInt(item.arg0));
                    var reward = Terminology.get(`missionReward_${item.arg1}`);
                    if (reward != null)
                    {
                        description = description.replace("{2}", reward);
                    }
                    else
                    {
                        description = description.replace("{2}", Terminology.get("unknown_question"));
                    }
                }
                break;
            case "quest":
                {
                    var startLocation = globalSystem.locationData.getDataById(item.variable);
                    if (startLocation != null && preview == false)
                    {
                        description = description.replace("{0}", startLocation.name);
                    }
                    else
                    {
                        description = description.replace("{0}", Terminology.get("unknown_question"));
                    }
                }
                break;
            case "record":
                {
                    var args = item.variable.split("/");
                    var survivorName = "";
                    for (var i = 0; i < args.length - 1; i++)
                    {
                        if (i > 0)
                        {
                            survivorName += Terminology.get("selection_and");
                        }
                        var survivor = globalSystem.survivorData.getDataById(args[i]);
                        if (survivor != null)
                        {
                            survivorName += survivor.name;
                        }
                    }
                    if (preview == false)
                    {
                        description = description.replace("{0}", survivorName);
                    }
                    else
                    {
                        description = description.replace("{0}", Terminology.get("unknown_question"));
                    }

                    var count = args[args.length - 1];
                    if (count != null && preview == false)
                    {
                        description = description.replace("{1}", count);
                    }
                    else
                    {
                        description = description.replace("{1}", Terminology.get("unknown_question"));
                    }
                }
                break;
            case "music":
                {
                    var sound = globalSystem.soundData.getDataById(item.arg0);
                    if (sound != null)
                    {
                        description = description.replace("{0}", sound.name);
                    }
                    else
                    {
                        description = description.replace("{0}", Terminology.get("unknown_question"));
                    }
                }
                break;
            case "eventArrivedLocation":
                {
                    description = description.replace("{0}", item.variable);

                    var arg = item.arg0.replace("itemGetFindByLetter", "");
                    var reward = Terminology.get(`letterReward_${arg}`);
                    if (reward != null)
                    {
                        description = description.replace("{1}", reward);
                    }
                    else
                    {
                        description = description.replace("{1}", Terminology.get("unknown_question"));
                    }
                }
                break;
            default:
                description = description.replace("{0}", item.variable);
                break;
        }

        if (item.accessory != null && item.accessory.description != null)
        {
            if (preview == false)
            {
                description = `${description}<br>${item.accessory.description}`;
            }
        }

        if (Number(item.weight) == 0)
        {
            description += Terminology.get("item_noWeight");
        }

        var result = "";
        if (addName)
        {
            result = `${name}<br><br>${description}<br>`;
        }
        else
        {
            result = `${description}<br>`;
        }

        return result;
    }

    static initVarialbe(item)
    {
        if (StringExtension.isNullOrEmpty(item.variable))
        {
            return;
        }

        var variable = null;
        switch (item.variable)
        {
            case "random5":
                {
                    variable = Random.range(5);
                }
                break;
            case "random10":
                {
                    variable = Random.range(10);
                }
                break;
            case "random5-10":
                {
                    variable = 5 + Random.range(5);
                }
                break;
            case "random5-20":
                {
                    variable = 5 + Random.range(15);
                }
                break;
            case "number4":
                {
                    var num = 1 + Random.range(9999);
                    variable = ('0000' + num).slice(-4);
                }
                break;
            case "location":
                {
                    var locations = globalSystem.areaManager.getAreaLocations();
                    if (locations == null)
                    {
                        locations = globalSystem.areaData.getDatasByKey("start", "true");
                    }
                    if (locations != null)
                    {
                        var startLocations = [];
                        for (var loc of locations)
                        {
                            if (Type.toBoolean(loc.start) == false)
                            {
                                continue;
                            }
                            startLocations.push(loc);
                        }
                        if (startLocations.length > 0)
                        {
                            var index = Random.range(startLocations.length);
                            var location = startLocations[index];
                            variable = location.location;
                        }
                    }
                }
                break;
            case "randomItem-material":
            case "randomItem-food":
            case "randomItem-cooking":
            case "randomItem-medicine":
            case "randomItem-tool":
                {
                    var tag = item.variable.replace("randomItem-", "");
                    var items = globalSystem.itemData.getDatasByKey("tag", tag);
                    if (items.length > 0)
                    {
                        var index = Random.range(items.length);
                        variable = items[index].id;
                    }
                }
                break;
            default:
                break;
        }

        if (variable != null)
        {
            item.variable = variable;
        }
    }

    static getItemNames(items, where = null, fullName = true)
    {
        var result = [];
        for (var i = 0; i < items.length; i++)
        {
            var item = items[i];
            if (where != null)
            {
                var valid = where(item);
                if (valid == false)
                {
                    continue;
                }
            }

            var already = false;
            var alreadyIndex = 0;
            var name = item.name;
            if (fullName)
            {
                name = ItemExecutor.getName(item);
            }
            var mergeable = Type.toBoolean(item.mergeable);
            if (mergeable)
            {
                for (var j = 0; j < result.length; j++)
                {
                    if (result[j].name == name)
                    {
                        already = true;
                        alreadyIndex = j;
                        break;
                    }
                }
            }

            if (already)
            {
                result[alreadyIndex].item = item;
                result[alreadyIndex].count += 1;
            }
            else
            {
                var data = { item: item, name: name, count: 1 };
                result.push(data);
            }
        }

        return result;
    }
}