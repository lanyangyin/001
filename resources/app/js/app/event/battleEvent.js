class BattleEvent extends Event
{
    constructor(args)
    {
        super("battle", 0, 1);

        this.encountSpeakType = args[0];
        this.query = args[1];
        this.arg = args[2];
        this.distance = Number(args[3]);
        this.fg = null;

        this.enemys = [];
        this.killed = [];
        this.encountSurvivors = [];
        this.turnCount = 0;
    }

    get tags()
    {
        return ["danger", "battle"];
    }

    get speakTypeKill()
    {
        return "kill";
    }

    get speakTypeWin()
    {
        return "battleWin";
    }

    setupEvent(survivor, stage)
    {
        // 敵生成
        var created = this.createEnemy(stage);
        if (created == false)
        {
            return;
        }

        if (this.enemys[0] != null)
        {
            var fg = this.enemys[0].data.fg;
            var fgType = this.enemys[0].data.fgType;
            var fgPosition = this.enemys[0].data.fgPosition;
            if (StringExtension.isValid(fg))
            {
                globalSystem.uiManager.foreground.addImage(fg, fgType, "default", fgPosition, 1);
                this.fg = fg;
            }

            var sound = this.enemys[0].data.sound;
            if (StringExtension.isValid(sound))
            {
                globalSystem.soundManager.playSe(sound);
            }
        }

        // エンカウント時のセリフ
        this.speakEncount(survivor);

        globalSystem.survivorManager.lock(survivor);
        globalSystem.cameraManager.focusSurvivor(survivor);
        globalSystem.cameraManager.disableRandomMove();
    }

    executeEvent(survivor, stage)
    {
        if (this.enemys.length == 0)
        {
            survivor.speak("nothing", []);
            return true;
        }

        if (this.encountSurvivors.length == 0)
        {
            this.setupEncountSurvivors(survivor);
            return false;
        }

        // 戦闘結果チェック
        var result = this.checkResult(survivor);
        if (result)
        {
            return true;
        }

        // 逃走チェック
        var checkEscape = this.checkEscape(survivor);
        if (checkEscape.checking)
        {
            if (checkEscape.escape)
            {
                return true;
            }
            return false;
        }

        // アイテム利用
        var itemUsed = this.useItem();
        if (itemUsed)
        {
            return false;
        }

        // 攻撃/ダメージ
        this.battle();

        return false;
    }

    exitEvent(survivor, stage)
    {
        globalSystem.survivorManager.unlock(survivor);
        globalSystem.cameraManager.focusReset();
        globalSystem.cameraManager.enableRandomMove();
    }

    onCanceled(survivor, stage)
    {
        survivor.speak("nothing", []);
    }

    attackEnemy(survivor, atack)
    {
        if (this.enemys.length == 0)
        {
            return;
        }

        var enemy = this.enemys[0];
        if (enemy == null)
        {
            return;
        }

        enemy.damage(atack, survivor);
        survivor.onAttack();
    }

    getEnemeys()
    {
        return this.enemys;
    }

    createEnemy(stage)
    {
        if (this.enemys.length != 0)
        {
            return true;
        }

        var emData = null;
        switch (this.query)
        {
            case "id":
                {
                    emData = globalSystem.enemyData.getDataById(this.arg);
                }
                break;
            case "stage":
                {
                    var level = Number(stage.enemyLevel);
                    emData = globalSystem.enemyData.getRandomByLevel(level);
                }
                break;
            case "level":
                {
                    var level = Number(this.arg);
                    emData = globalSystem.enemyData.getRandomByLevel(level);
                }
                break;
            case "bossLevel":
                {
                    var level = Number(this.arg);
                    emData = globalSystem.enemyData.getRandomByLevel(level, "boss");
                }
                break;
            default:
                break;
        }

        if (emData == null)
        {
            console.log(`BattleEvent : EnemyDataが見つかりませんでした query=${this.query} arg=${this.arg}`);
            return false;
        }

        var em = new Enemy(emData);
        if (em == null)
        {
            return false;
        }
        em.distance += this.distance;

        this.enemys.push(em);
        return true;
    }

    speakEncount(survivor)
    {
        var enemyName = this.getEnemysName();
        survivor.speak(this.encountSpeakType, [enemyName]);

        var noWeapon = (survivor.weapon == null);
        var noAmmos = false;
        if (survivor.weapon != null && StringExtension.isNullOrEmpty(survivor.weapon.arg2) == false)
        {
            noAmmos = (survivor.inventory.getItemById(survivor.weapon.arg2) == null);
        }
        if (noAmmos)
        {
            survivor.speak("battle_noAmmo", []);
        }
        else if (noWeapon)
        {
            survivor.speak("battle_noWeapon", []);
        }
    }

    setupEncountSurvivors(survivor)
    {
        var enemyName = this.getEnemysName();
        for (var s of globalSystem.survivorManager.survivors)
        {
            if (s.valid == false)
            {
                continue;
            }
            if (s != survivor)
            {
                s.speak("joinBattle", [enemyName]);
            }
            this.encountSurvivors.push(s);
        }
    }

    useItem()
    {
        for (var s of this.encountSurvivors)
        {
            if (s.valid == false)
            {
                continue;
            }

            var input = globalSystem.uiManager.textInput[s.index].getConverted();
            var text = globalSystem.uiManager.textInput[s.index].text;
            if (StringExtension.isNullOrEmpty(input) == false)
            {
                if (ItemUseEvent.isUseable(s, input))
                {
                    globalSystem.uiManager.textLine[s.index].writeInput(text);
                    globalSystem.uiManager.textInput[s.index].reset();
                    ItemUseEvent.useItemByName(s, input, true);
                    return true;
                }
            }
        }

        return false;
    }

    checkResult(survivor)
    {
        if (this.enemys.length > 0 && this.enemys[0].hp <= 0)
        {
            var killed = this.enemys.shift();
            this.killed.push(killed);
            survivor.speak(this.speakTypeKill, [killed.name]);
            globalSystem.soundManager.playSe("down00");
            if (this.fg != null)
            {
                var fg = globalSystem.uiManager.foreground.getElement(this.fg);
                if (fg != null)
                {
                    fg.remove(1);
                }
            }
        }

        if (survivor.isDead == false && this.enemys.length == 0)
        {
            this.onWin(survivor);
            globalSystem.survivorManager.unlock(survivor);
            return true;
        }

        return false;
    }

    checkEscape(survivor)
    {
        var result = { escape: false, checking: false };
        return result;
    }

    battle()
    {
        var survivorCount = this.encountSurvivors.length;
        var enemySpeed = this.enemys[0].speed;
        var turn = this.turnCount % (survivorCount + enemySpeed);
        if (turn < this.encountSurvivors.length)
        {
            var s = this.encountSurvivors[turn];
            s.attack(this.enemys[0]);
        }
        else
        {
            var index = Random.range(this.encountSurvivors.length);
            var target = this.encountSurvivors[index];
            this.enemys[0].attackRandom(target);
        }

        this.turnCount++;
    }

    getEnemysName()
    {
        var enemyName = "";
        for (var i = 0; i < this.enemys.length; i++)
        {
            enemyName += this.enemys[i].name;
            if (i < this.enemys.length - 1)
            {
                enemyName += Terminology.get("battle_and");
            }
        }
        return enemyName;
    }

    onWin(survivor)
    {
        survivor.speak(this.speakTypeWin, []);

        if (this.killed.length == 0)
        {
            return;
        }

        for (var enemy of this.killed)
        {
            var ratio = parseFloat(enemy.data.defeatedEventRatio);
            if (ratio == 0)
            {
                continue;
            }

            var random = Random.range(100) / 100.0;
            if (random > ratio)
            {
                continue;
            }

            var speakId = enemy.data.defeatedSpeak;
            if (StringExtension.isValid(speakId))
            {
                survivor.speak(speakId, [enemy.name]);
            }

            var event = EventGenerator.generateById(enemy.data.defeatedEvent);
            if (event != null)
            {
                survivor.insertEvent(event, Event.executeType.event);
            }
        }
    }

    getUseStamina()
    {
        return 5;
    }

    isWaitInput()
    {
        return true;
    }
}
