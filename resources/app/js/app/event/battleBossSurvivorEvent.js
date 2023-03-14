class BattleBossSurvivorEvent extends BattleBossEvent
{
    constructor(args)
    {
        super(args);

        this.temporaryItems = [];
    }

    get speakTypeKill()
    {
        return "killSurvivor";
    }

    get speakTypeWin()
    {
        return "battleWinSurvivor";
    }

    setupEvent(survivor, stage)
    {
        super.setupEvent(survivor, stage);

        survivor.attackSpeakType = "battle_attack_survivor";
        survivor.damageSpeakType = "battle_damage_survivor";
        survivor.isPlayDamageEffect = false;

        survivor.speak("itemPushHouse", []);

        this.temporaryItems = [];
        for (var item of survivor.inventory.list)
        {
            this.temporaryItems.push(item);
            survivor.removeItem(item);
            globalSystem.houseManager.pushItem(item, false);
        }
    }

    exitEvent(survivor, stage)
    {
        super.exitEvent(survivor, stage);

        survivor.attackSpeakType = Survivor.defaultAttackSpeakType;
        survivor.damageSpeakType = Survivor.defaultDamageSpeakType;
        survivor.isPlayDamageEffect = true;

        for (var item of this.temporaryItems)
        {
            survivor.pushItem(item);
            globalSystem.houseManager.removeItem(item);
        }
    }

    checkEscape(survivor)
    {
        var result = { escape: false, checking: false };
        return result;
    }
}
