class Survivor extends Character
{
    constructor(index, data)
    {
        super(data);
        this.index = index;
        this.currentStage = null;
        this.eventExecutor = new SurvivorEventExecutor();
        this.inventory = new survivorInventory();
        this.skillHolder = this.setupSkill(data);
        this.image = data.image;
        this.story = data.story;
        this.statusChanged = false;
        this.callHandler.reset();
        this.callObject = data.callObject;
        this.attackSpeakType = Survivor.defaultAttackSpeakType;
        this.damageSpeakType = Survivor.defaultDamageSpeakType;
        this.isPlayAttackEffect = true;
        this.isPlayDamageEffect = true;
        this.prevStaminaIndex = 0;
        this.costumeIgnore = false;
    }

    static get defaultAttackSpeakType()
    {
        return "battle_attack";
    }

    static get defaultDamageSpeakType()
    {
        return "battle_damage";
    }

    get currentEvent()
    {
        return this.eventExecutor.currentEvent;
    }

    get nextEvents()
    {
        return this.eventExecutor.nextEvents;
    }

    get callHandler()
    {
        return this.eventExecutor.callHandler;
    }

    get callEvents()
    {
        return this.callHandler.events;
    }

    get isCallable()
    {
        var talking = this.eventExecutor.hasEvent(TalkEvent);
        if (talking == false && this.currentStage == null)
        {
            return false;
        }
        var locker = globalSystem.survivorManager.locking;
        if (locker != null)
        {
            if (locker.currentEvent != null && locker.currentEvent.isWaitInput())
            {
                return true;
            }
            if (this != globalSystem.survivorManager.locking)
            {
                return false;
            }
        }
        return true;
    }

    preUpdateCharacter()
    {
        this.statusChanged = false;
    }

    updateCharacter()
    {
        this.eventExecutor.update(this);
        this.updateSkill();
    }

    updateSkill()
    {
        this.skillHolder.update(this);
    }

    resetCharacter()
    {
        this.currentStage = null;
        this.callObject = this.data.callObject;
        this.eventExecutor.reset();
        this.callHandler.reset();
        this.skillHolder = this.setupSkill(this.data);
        this.prevStaminaIndex = this.getStaminaIndex();
        this.attackSpeakType = Survivor.defaultAttackSpeakType;
        this.damageSpeakType = Survivor.defaultDamageSpeakType;
        this.costumeIgnore = false;
    }

    resetTemporary()
    {
        this.inventory.resetTemporary();
    }

    attack(target)
    {
        var reach = 0;
        var weapon = this.weapon;
        if (weapon != null)
        {
            var applicable = ItemExecutor.isApplicable(weapon, this);
            if (applicable)
            {
                reach = Number(weapon.arg3);
            }
        }

        if (target.distance > reach)
        {
            var miss = Random.range(2);
            if (miss == 0)
            {
                this.speak("battle_attack_miss", []);
                globalSystem.soundManager.playSe("miss00");
                return;
            }
        }

        var result = ItemExecutor.apply(weapon, this);
        switch (result)
        {
            case ItemExecutor.applyResult.use:
                {
                    this.speak("battle_attack_weapon", []);
                }
                break;
            case ItemExecutor.applyResult.broken:
                {
                    this.speak("battle_attack_weapon", []);
                    this.speak("weaponBroken", [weapon.name]);
                    globalSystem.soundManager.playSe("broken00");
                }
                break;
            default:
                {
                    this.speak(this.attackSpeakType, []);
                    globalSystem.soundManager.playSe("attack00");
                }
                break;
        }

        super.attack(target);
    }

    damage(point, source, speak = true)
    {
        super.damage(point, source);

        if (this.isDead == false && speak)
        {
            this.speak(this.damageSpeakType, []);

            var armor = this.armor;
            var result = ItemExecutor.apply(armor, this);
            if (result == ItemExecutor.applyResult.broken)
            {
                globalSystem.soundManager.playSe("broken00");
                this.speak("weaponBroken", [armor.name]);
            }
        }
    }

    onAttack()
    {
        if (this.isPlayAttackEffect)
        {
            globalSystem.uiManager.quest.playHitEffect();
        }
        globalSystem.uiManager.background.shake({ x: 0, y: 5 }, 0.5);
    }

    onHeal()
    {
        globalSystem.uiManager.quest.playHealEffect();
        this.statusChanged = true;
    }

    onDamage()
    {
        if (this.isPlayDamageEffect)
        {
            globalSystem.uiManager.quest.playDamageEffect();
        }
        globalSystem.uiManager.background.shake({ x: 3, y: 0 }, 0.5);
        globalSystem.uiManager.foreground.shake({ x: 2, y: 0 }, 0.5);
        this.statusChanged = true;
    }

    onDead()
    {
        this.speak("dead", []);
        this.resetCharacter();
        globalSystem.survivorManager.unlock(this);
        globalSystem.cameraManager.focusReset();

        var fg = globalSystem.uiManager.foreground.getElement(this.image);
        if (fg != null)
        {
            fg.fadeOut(1, true);
        }
    }

    onUseStamina()
    {
        var index = this.getStaminaIndex();
        if (index > this.prevStaminaIndex && index > 1 && index < 5)
        {
            var id = `changedStamina_${index}`;
            this.speak(id, []);
        }
        this.prevStaminaIndex = index;
        this.statusChanged = true;
    }

    onStaminaLost()
    {
        var event = new StaminaLostEvent();
        this.pushEvent(event, Event.executeType.event);
    }

    onQuestStart()
    {
        this.inventory.onQuestStart(this);
    }

    onQuestEnd(complete)
    {
        this.inventory.onQuestEnd(this, complete);
    }

    onArrivedLocation(location)
    {
        this.inventory.onArrivedLocation(this, location);
    }

    onArrivedLocationBefore(location)
    {
        this.inventory.onArrivedLocationBefore(this, location);
    }

    setStage(stage)
    {
        var prev = this.currentStage;

        this.currentStage = stage;
        this.statusChanged = true;

        if (prev != stage)
        {
            this.eventExecutor.onChangeStage(stage, prev);
        }
    }

    pushEvent(event, executeType)
    {
        event.executeType = executeType;
        this.eventExecutor.pushNext(this, event);
    }

    insertEvent(event, executeType)
    {
        event.executeType = executeType;
        this.eventExecutor.insertNext(this, event);
    }

    clearNextEvents()
    {
        this.eventExecutor.clearNexts();
    }

    getEventsByType(eventType)
    {
        return this.eventExecutor.getEventsByType(eventType);
    }

    hasEvent(eventType)
    {
        return this.eventExecutor.hasEvent(eventType);
    }

    pushCallEvent(event)
    {
        if (this.callEvents.indexOf(event) != -1)
        {
            return;
        }
        this.callEvents.push(event);
    }

    removeNextEvent(event)
    {
        this.eventExecutor.removeNext(event);
    }

    resetEvents()
    {
        this.eventExecutor.reset();
    }

    pushItem(item)
    {
        var result = this.inventory.push(item);
        if (result)
        {
            this.statusChanged = true;
        }

        return result;
    }

    getItemById(id)
    {
        return this.inventory.getItemById(id);
    }

    getItemsById(id)
    {
        return this.inventory.getItemsById(id);
    }

    getItemByName(name)
    {
        return this.inventory.getItemByName(name);
    }

    getItemByType(type)
    {
        return this.inventory.getItemByType(type);
    }

    getItemsByType(type)
    {
        return this.inventory.getItemsByType(type);
    }

    getItemsByKey(key, value)
    {
        return this.inventory.getItemsByKey(key, value);
    }

    removeItem(item)
    {
        var result = this.inventory.remove(item);

        // 装備品を収納した場合は外す
        var prevWeapon = this.weapon;
        var prevArmor = this.armor;
        this.weapon = null;
        this.armor = null;
        for (var i = 0; i < this.inventory.list.length; i++)
        {
            if (this.inventory.list[i] === prevWeapon)
            {
                this.equipWeapon(prevWeapon);
            }
            else if (this.inventory.list[i] === prevArmor)
            {
                this.equipArmor(prevArmor);
            }
        }

        this.statusChanged = true;
        return result;
    }

    lostItem(item)
    {
        var result = this.removeItem(item);
        return result;
    }

    removeAllItems()
    {
        this.inventory.removeAll();
        this.weapon = null;
        this.armor = null;
        this.statusChanged = true;
    }

    lostAllItems()
    {
        this.inventory.lostAll();
        this.weapon = null;
        this.armor = null;
        this.statusChanged = true;
    }

    hasItem(item)
    {
        var result = this.inventory.has(item);
        return result;
    }

    equipWeapon(weapon)
    {
        var result = super.equipWeapon(weapon);
        this.statusChanged = true;
        return result;
    }

    equipArmor(armor)
    {
        var result = super.equipArmor(armor);
        this.statusChanged = true;
        return result;
    }

    hasSkill(skill)
    {
        return this.skillHolder.hasSkill(skill);
    }

    ignoreCostume(value)
    {
        this.costumeIgnore = value;
    }

    getCostume()
    {
        if (this.costumeIgnore)
        {
            return ForegroundElement.defaultCostume;
        }

        if (this.armor == null)
        {
            return ForegroundElement.defaultCostume;
        }

        var result = this.armor.arg2;
        return result;
    }

    applyCostume()
    {
        var fg = globalSystem.uiManager.foreground.getElement(this.image);
        var costume = this.getCostume();
        if (fg != null && fg.costume != costume)
        {
            globalSystem.uiManager.foreground.addImage(fg.id, fg.type, costume, fg.positionType, 0.5);
        }
    }

    setupSkill(data)
    {
        var result = null;
        var length = data.skills.length;
        for (var i = 0; i < length; i++)
        {
            var skill = data.skills[i];
            var scenario = data.skillConditionScenario[i];
            if (StringExtension.isNullOrEmpty(scenario))
            {
                result = new SurvivorSkillHolder(skill);
                break;
            }
            if (globalSystem.scenarioManager.isFinished(scenario))
            {
                result = new SurvivorSkillHolder(skill);
                break;
            }
        }

        return result;
    }

    getSkill(skill)
    {
        return this.skillHolder.getSkill(skill);
    }

    pushSkill(skill)
    {
        return this.skillHolder.pushSkill(skill);
    }

    removeSkill(skill)
    {
        return this.skillHolder.removeSkill(skill);
    }

    isFoodRatio(type)
    {
        if (this.data.favoriteFood == type)
        {
            return 2.0;
        }
        if (this.data.dislikeFood == type)
        {
            return 0.6;
        }
        return 1.0;
    }

    speak(type, params, skippable = false)
    {
        var correct = globalSystem.speakData.getDatasByKey("type", type);
        if (correct.length == 0)
        {
            console.error(`speak data が見つかりませんでした。 ${type}`);
            return;
        }

        var data = correct[Random.range(correct.length)];
        this.speakText(data, params, skippable);
    }

    speakWithArg(type, arg, params, skippable = false)
    {
        var correctType = globalSystem.speakData.getDatasByKey("type", type);
        var correct = [];
        for (var i = correctType.length - 1; i >= 0; i--)
        {
            if (correctType[i].arg0 == arg)
            {
                correct.push(correctType[i]);
            }
        }

        if (correct.length == 0)
        {
            console.error(`speak data が見つかりませんでした。 ${type} - ${arg}`);
            return;
        }

        var data = correct[Random.range(correct.length)];
        this.speakText(data, params, skippable);
    }

    speakText(data, params, skippable = false)
    {
        var text = data[this.id];
        for (var i = 0; i < params.length; i++)
        {
            text = text.replace("{" + i + "}", params[i]);
        }

        var texts = text.split("<br>");
        for (var t of texts)
        {
            t = `「${t}」`;
            globalSystem.uiManager.textLine[this.index].writeLine(t, null, null, skippable);
        }

        if (StringExtension.isValid(data.fgType))
        {
            var fg = globalSystem.uiManager.foreground.getElement(this.image);
            var costume = this.getCostume();
            if (fg != null && (fg.type != data.fgType || fg.costume != costume))
            {
                globalSystem.uiManager.foreground.addImage(fg.id, data.fgType, costume, fg.positionType, 0.5);
            }
        }
    }

    describe(text, params, skippable = false)
    {
        for (var i = 0; i < params.length; i++)
        {
            text = text.replace(`{${i}}`, params[i]);
        }

        var texts = text.split("<br>");
        for (var t of texts)
        {
            if (StringExtension.isNullOrEmpty(t))
            {
                continue;
            }
            globalSystem.uiManager.textLine[this.index].writeLine(t, null, Color.marineBlue, skippable);
        }
    }

    getVitalIndex()
    {
        var ratio = this.hpRatio;
        if (ratio <= 0)
        {
            return 5;
        }
        else if (ratio < 0.1)
        {
            return 4;
        }
        else if (ratio < 0.3)
        {
            return 3;
        }
        else if (ratio < 0.5)
        {
            return 2;
        }
        else if (ratio < 0.8)
        {
            return 1;
        }
        else
        {
            return 0;
        }
    }

    getStaminaIndex()
    {
        var ratio = this.staminaRatio;
        if (ratio <= 0)
        {
            return 5;
        }
        else if (ratio < 0.1)
        {
            return 4;
        }
        else if (ratio < 0.3)
        {
            return 3;
        }
        else if (ratio < 0.5)
        {
            return 2;
        }
        else if (ratio < 0.8)
        {
            return 1;
        }
        else
        {
            return 0;
        }
    }

    getVitalButton()
    {
        var index = this.getVitalIndex();
        var text = Terminology.get(`vital_${index}`);
        var color = "";
        switch (index)
        {
            case 0:
                color = Color.darkGreen;
                break;
            case 1:
                color = Color.darkGreen;
                break;
            case 2:
                color = Color.darkYellow;
                break;
            case 3:
                color = Color.red;
                break;
            case 4:
                color = Color.darkRed;
                break;
            case 5:
                color = Color.darkRed;
                break;
            default:
                color = Color.darkGreen;
                break;
        }
        return `<button class='app borderless' style='color:${color}; position:relative;' onclick='globalSystem.survivorManager.survivors[${this.index}].openVitalDialog(); event.stopPropagation();'>${text}</button>`;
    }

    getStaminaButton()
    {
        var index = this.getStaminaIndex();
        var text = Terminology.get(`stamina_${index}`);
        var color = "";
        switch (index)
        {
            case 0:
                color = Color.darkGreen;
                break;
            case 1:
                color = Color.darkGreen;
                break;
            case 2:
                color = Color.darkYellow;
                break;
            case 3:
                color = Color.red;
                break;
            case 4:
                color = Color.darkRed;
                break;
            case 5:
                color = Color.darkRed;
                break;
            default:
                color = Color.darkGreen;
                break;
        }
        return `<button class='app borderless' style='color:${color}; position:relative;' onclick='globalSystem.survivorManager.survivors[${this.index}].openStaminaDialog(); event.stopPropagation();'>${text}</button>`;
    }

    openVitalDialog()
    {
        var index = this.getVitalIndex();
        var dialog = Terminology.get(`vitalDescription_${index}`);
        dialog = dialog.replace("{0}", this.hp);
        dialog = dialog.replace("{1}", this.hpMax);
        var description = Terminology.get(`vitalDescription`);
        globalSystem.uiManager.dialog.open(dialog + description);
    }

    openStaminaDialog()
    {
        var index = this.getStaminaIndex();
        var dialog = Terminology.get(`staminaDescription_${index}`);
        dialog = dialog.replace("{0}", this.stamina);
        dialog = dialog.replace("{1}", this.staminaMax);
        var description = Terminology.get(`staminaDescription`);
        globalSystem.uiManager.dialog.open(dialog + description);
    }
}
