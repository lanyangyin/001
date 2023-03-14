class TalkEvent extends Event
{
    constructor(data)
    {
        super("talk", 0, 1);
        var id = data[0];

        this.line = globalSystem.talkData.getDatasById(id);
        this.index = 0;

        this.currentData = null;
        this.labels = [];
        this.skipTimer = 0;
        this.survivorIndex = 0;
        this.timer = 0;
        this.prevInput = null;
        this.preloadedImages = [];
        this.speakers = [];
        this.isInitialized = false;
    }

    static get textColor()
    {
        var result =
            [
                Color.marineBlue,
                Color.olivedrab,
                Color.olivedrab,
                Color.olivedrab,
                Color.olivedrab,
            ];
        return result;
    }

    static setupUI(survivor)
    {
        var length = globalSystem.survivorManager.survivorMax;
        for (var i = 0; i < length; i++)
        {
            if (i == survivor.index)
            {
                continue;
            }
            globalSystem.uiManager.textLine[i].setVisible(false);
        }
    }

    static setupForeground(survivor)
    {
        globalSystem.uiManager.foreground.clear();

        if (survivor != null)
        {
            globalSystem.uiManager.foreground.addImage(survivor.image, ForegroundElement.defaultType, ForegroundElement.defaultCostume, "right-right");
            survivor.ignoreCostume(true);
        }
    }

    execute(survivor, stage)
    {
        var result = super.execute(survivor, stage);

        if (globalSystem.uiManager.window.isTouching && globalSystem.uiManager.window.isScrolling == false)
        {
            this.skipTimer += globalSystem.time.deltaTime;
        }
        else
        {
            this.skipTimer = 0;
        }

        return result;
    }

    setupEvent(survivor, stage)
    {
        this.survivorIndex = survivor.index;
        globalSystem.survivorManager.lock(survivor);
        globalSystem.cameraManager.enableRandomMove();
        globalSystem.uiManager.textLine[survivor.index].useWriteTimer = false;

        this.initialize(survivor, stage);
    }

    executeEvent(survivor, stage)
    {
        if (this.index >= this.line.length)
        {
            return true;
        }

        globalSystem.textInputManager.lock();

        var isBusy = globalSystem.uiManager.textLine[survivor.index].isBusy;
        if (isBusy)
        {
            return false;
        }

        var data = this.line[this.index];
        var result = { end: false, next: false };
        var command = data.command;
        if (this.currentData != data)
        {
            this.onChangeCommand();
        }

        // コマンド実行
        result = this[command](data, survivor, stage);
        this.currentData = data;

        if (result.end)
        {
            return true;
        }
        if (result.next)
        {
            this.index++;
        }
        return false;
    }

    exitEvent(survivor, stage)
    {
        globalSystem.textInputManager.unlock();
        globalSystem.survivorManager.unlock(survivor);
        globalSystem.uiManager.textLine[survivor.index].useWriteTimer = true;
        globalSystem.uiManager.textInput[survivor.index].reset();
        this.preloadedImages = null;
    }

    initialize(survivor, stage)
    {
        if (this.isInitialized)
        {
            return;
        }

        var scenario = globalSystem.questManager.currentScenario;
        if (scenario.type == "quest")
        {
            TalkEvent.setupUI(survivor);
            TalkEvent.setupForeground(survivor);
        }

        // ラベル読み込み
        this.setupLabels();

        this.preload();

        this.isInitialized = true;
    }

    getSpeaker(id)
    {
        for (var survivor of globalSystem.survivorManager.survivors)
        {
            if (survivor.id == id)
            {
                return survivor;
            }
        }
        return null;
    }

    isUseSurvivorSpeed()
    {
        return false;
    }

    onChangeCommand()
    {
        globalSystem.uiManager.textLine[this.survivorIndex].setState(TextLine.state.none);
    }

    setupLabels()
    {
        this.labels = [];
        for (var i = 0; i < this.line.length; i++)
        {
            var data = this.line[i];
            if (data.command == "label")
            {
                var label = { key: data.arg0, index: i };
                this.labels.push(label);
            }
        }
    }

    jumpLabel(key)
    {
        var index = -1;
        for (var label of this.labels)
        {
            if (label.key == key)
            {
                index = label.index;
                break;
            }
        }
        if (index == -1)
        {
            return false;
        }

        this.index = index;
        return true;
    }

    preload()
    {
        var preload = [];
        for (var i = 0; i < this.line.length; i++)
        {
            var data = this.line[i];
            switch (data.command)
            {
                case "bg":
                case "fadeOverlay":
                    {
                        var list = globalSystem.backgroundData.getDatasById(data.arg0);
                        if (list != null)
                        {
                            for (var data of list)
                            {
                                if (preload.indexOf(data.path) == -1)
                                {
                                    var image = globalSystem.resource.loadImage(data.path);
                                    this.preloadedImages.push(image);
                                    preload.push(data.path);
                                }
                            }
                        }
                    }
                    break;
                case "fg":
                    {
                        var data = globalSystem.foregroundData.getData(data.arg0, data.arg3, data.arg4);
                        if (preload.indexOf(data.path) == -1)
                        {
                            globalSystem.uiManager.foreground.preload(data.id, data.type, data.costume);
                            preload.push(data.path);
                        }
                    }
                    break;
                default:
                    break;
            }
        }
    }

    getTextColor(speaker)
    {
        var colors = TalkEvent.textColor;
        if (speaker == null)
        {
            return colors[0];
        }
        for (var i = 0; i < this.speakers.length; i++)
        {
            if (this.speakers[i] == speaker)
            {
                return colors[i];
            }
        }
        var index = this.speakers.length;
        var result = colors[index];
        this.speakers.push(speaker);

        return result;
    }

    getNextTextColor()
    {
        var index = this.speakers.length;
        var colors = TalkEvent.textColor;
        var result = colors[index];
        return result;
    }

    applyTag(text)
    {
        // 変数
        var variableTag = "<variable>";
        var variableEndTag = "</variable>";
        for (var i = 0; i < 10; i++)
        {
            var variableIndex = text.indexOf(variableTag);
            if (variableIndex == -1)
            {
                break;
            }

            var variableEndIndex = text.indexOf(variableEndTag);
            var variableId = text.substring(variableIndex + variableTag.length, variableEndIndex);
            var value = globalSystem.questManager.getTemporaryVariable(variableId);
            if (value != null)
            {
                text = text.replace(variableId, value);
                text = text.replace(variableTag, "");
                text = text.replace(variableEndTag, "");
            }
        }

        return text;
    }

    talk(data, survivor, stage)
    {
        var text = data.arg1;
        text = this.applyTag(text);
        if (data.wrote == null || data.wrote == false)
        {
            if (data.arg0)
            {
                var speaker = this.getSpeaker(data.arg0);
                if (speaker != null && speaker == survivor)
                {
                    speaker.speak(this.type, [text], true);
                }
                else
                {
                    var name = data.arg0;
                    var color = Color.marineBlue;
                    speaker = globalSystem.survivorData.getDataById(data.arg0);
                    if (speaker != null)
                    {
                        name = speaker.name;
                        color = this.getTextColor(speaker);
                    }
                    else
                    {
                        color = this.getNextTextColor();
                    }
                    text = `「${text}」`;
                    globalSystem.uiManager.textLine[survivor.index].writeLine(text, name, color, true);
                }
            }
            else
            {
                globalSystem.uiManager.textLine[survivor.index].writeLine(text, null, null, true);
            }
            data.wrote = true;

            return { end: false, next: false };
        }
        else
        {
            // 入力をリセットする
            globalSystem.uiManager.textInput[survivor.index].reset();

            data.wrote = false;
            return { end: false, next: true };
        }
    }

    describe(data, survivor, stage)
    {
        var text = data.arg0;
        if (data.wrote == null || data.wrote == false)
        {
            globalSystem.uiManager.textLine[survivor.index].writeLine(text, null, Color.marineBlue, true);
            data.wrote = true;
            return { end: false, next: false };
        }
        else
        {
            // 入力をリセットする
            globalSystem.uiManager.textInput[survivor.index].reset();
            data.wrote = false;
            return { end: false, next: true };
        }
    }

    wait(data, survivor, stage)
    {
        var time = parseFloat(data.arg0);
        if (this.timer < time)
        {
            this.timer += globalSystem.time.deltaTime;
            return { end: false, next: false };
        }

        this.timer = 0;
        return { end: false, next: true };
    }

    label(data, survivor, stage)
    {
        // 呼び出されても何もしない
        return { end: false, next: true };
    }

    jump(data, survivor, stage)
    {
        var key = data.arg0;
        var result = this.jumpLabel(key);
        return { end: false, next: !result };
    }

    branch(data, survivor, stage)
    {
        var condition = data.arg0;
        var jumped = false;
        switch (condition)
        {
            case "random":
                {
                    var random = Random.range(100) / 100.0;
                    if (random < Number(data.arg1))
                    {
                        jumped = this.jumpLabel(data.arg2);
                    }
                    else
                    {
                        jumped = this.jumpLabel(data.arg3);
                    }
                }
                break;
            case "prevInput":
                {
                    var text = data.arg1;
                    if (text == this.prevInput)
                    {
                        jumped = this.jumpLabel(data.arg2);
                    }
                    else
                    {
                        jumped = this.jumpLabel(data.arg3);
                    }
                }
                break;
            case "hasItem":
                {
                    var count = survivor.inventory.count;
                    if (count > 0)
                    {
                        jumped = this.jumpLabel(data.arg1);
                    }
                    else
                    {
                        jumped = this.jumpLabel(data.arg2);
                    }
                }
                break;
            case "survivorCount":
                {
                    var count = Number(data.arg1);
                    if (globalSystem.survivorManager.survivorCount == count)
                    {
                        jumped = this.jumpLabel(data.arg2);
                    }
                    else
                    {
                        jumped = this.jumpLabel(data.arg3);
                    }
                }
                break;
            case "finishedScenario":
                {
                    var id = data.arg1;
                    if (globalSystem.scenarioManager.isFinished(id))
                    {
                        jumped = this.jumpLabel(data.arg2);
                    }
                    else
                    {
                        jumped = this.jumpLabel(data.arg3);
                    }
                }
                break;
            default:
                break;
        }

        var next = (jumped == false);
        return { end: false, next: next };
    }

    waitCall(data, survivor, stage)
    {
        if (globalSystem.uiManager.textLine[survivor.index].currentState != TextLine.state.waiting)
        {
            globalSystem.uiManager.textLine[survivor.index].setState(TextLine.state.waiting);
        }

        globalSystem.textInputManager.unlock();

        var input = globalSystem.uiManager.textInput[survivor.index].getConverted(true);
        var text = globalSystem.uiManager.textInput[survivor.index].text;
        if (StringExtension.isNullOrEmpty(input))
        {
            return { end: false, next: false };
        }

        globalSystem.uiManager.textInput[survivor.index].reset();
        globalSystem.uiManager.textLine[survivor.index].writeInput(text);
        globalSystem.uiManager.textLine[survivor.index].setState(TextLine.state.busy);

        this.prevInput = input;

        if (input == data.arg0)
        {
            var jumped = this.jumpLabel(data.arg1);
            var next = (jumped == false);
            return { end: false, next: next };
        }
        else
        {
            var jumped = this.jumpLabel(data.arg2);
            var next = (jumped == false);
            return { end: false, next: next };
        }
    }

    newPage(data, survivor, stage)
    {
        globalSystem.uiManager.textLine[survivor.index].reset();
        return { end: false, next: true };
    }

    fadeOut(data, survivor, stage)
    {
        if (this.timer == 0)
        {
            globalSystem.uiManager.fade.out(data.arg0);
        }

        var time = parseFloat(data.arg0);
        if (this.timer < time)
        {
            this.timer += globalSystem.time.deltaTime;
            return { end: false, next: false };
        }

        this.timer = 0;
        return { end: false, next: true };
    }

    fadeIn(data, survivor, stage)
    {
        if (this.timer == 0)
        {
            globalSystem.uiManager.fade.in(data.arg0);

        }

        var time = parseFloat(data.arg0);
        if (this.timer < time)
        {
            this.timer += globalSystem.time.deltaTime;
            return { end: false, next: false };
        }

        this.timer = 0;
        return { end: false, next: true };
    }

    bg(data, survivor, stage)
    {
        var image = data.arg0;
        var time = 0;
        var layer = 0;
        if (StringExtension.isValid(data.arg1))
        {
            time = parseFloat(data.arg1);
        }
        if (StringExtension.isValid(data.arg2))
        {
            layer = parseInt(data.arg2);
        }
        globalSystem.uiManager.background.setImage(image, layer, time);
        return { end: false, next: true };
    }

    bgFadeOut(data, survivor, stage)
    {
        var time = parseFloat(data.arg0);
        var layer = parseInt(data.arg1);
        globalSystem.uiManager.background.fadeOut(time, layer);
        return { end: false, next: true };
    }

    fg(data, survivor, stage)
    {
        var waitTime = 0;
        if (data.arg2 != null)
        {
            waitTime = parseFloat(data.arg2);
        }

        if (this.timer == 0)
        {
            var id = data.arg0;
            var position = data.arg1;
            var time = data.arg2;
            var type = data.arg3;
            var costume = data.arg4;
            if (StringExtension.isNullOrEmpty(type))
            {
                type = ForegroundElement.defaultType;
            }
            if (StringExtension.isNullOrEmpty(costume))
            {
                costume = ForegroundElement.defaultCostume;
            }
            globalSystem.uiManager.foreground.addImage(id, type, costume, position, time);
        }

        if (this.timer < waitTime)
        {
            this.timer += globalSystem.time.deltaTime;
            return { end: false, next: false };
        }

        this.timer = 0;
        return { end: false, next: true };
    }

    fgRemove(data, survivor, stage)
    {
        var waitTime = 0;
        if (data.arg1 != null)
        {
            waitTime = parseFloat(data.arg1);
        }

        if (this.timer == 0)
        {
            var id = data.arg0;
            var fg = globalSystem.uiManager.foreground.getElement(id);
            if (fg != null)
            {
                var time = Number(data.arg1);
                fg.remove(time);
            }
        }

        if (this.timer < waitTime)
        {
            this.timer += globalSystem.time.deltaTime;
            return { end: false, next: false };
        }

        this.timer = 0;
        return { end: false, next: true };
    }

    fgClear(data, survivor, stage)
    {
        globalSystem.uiManager.foreground.clearImage();
        return { end: false, next: true };
    }

    playBgm(data, survivor, stage)
    {
        globalSystem.soundManager.playBgm(data.arg0);
        return { end: false, next: true };
    }

    pauseBgm(data, survivor, stage)
    {
        globalSystem.soundManager.pauseBgm();
        return { end: false, next: true };
    }

    playSe(data, survivor, stage)
    {
        globalSystem.soundManager.playSe(data.arg0);
        return { end: false, next: true };
    }


    camera(data, survivor, stage)
    {
        var id = data.arg0;
        globalSystem.cameraManager.request(id);
        globalSystem.cameraManager.disableRandomMove();
        return { end: false, next: true };
    }

    releaseCamera(data, survivor, stage)
    {
        globalSystem.cameraManager.enableRandomMove();
        return { end: false, next: true };
    }

    showStatus(data, survivor, stage)
    {
        for (var i = 0; i < globalSystem.uiManager.status.length; i++)
        {
            globalSystem.uiManager.status[i].show();
        }
        return { end: false, next: true };
    }

    hideStatus(data, survivor, stage)
    {
        for (var i = 0; i < globalSystem.uiManager.status.length; i++)
        {
            globalSystem.uiManager.status[i].hide();
        }
        return { end: false, next: true };
    }

    pushItem(data, survivor, stage)
    {
        if (globalSystem.questManager.isReplay)
        {
            return { end: false, next: true };
        }

        var item = globalSystem.itemData.getDataById(data.arg0);
        if (item == null)
        {
            return { end: false, next: true };
        }
        survivor.pushItem(item);
        return { end: false, next: true };
    }

    pushItemHouse(data, survivor, stage)
    {
        if (globalSystem.questManager.isReplay)
        {
            return { end: false, next: true };
        }

        var item = globalSystem.itemData.getDataById(data.arg0);
        if (item == null)
        {
            return { end: false, next: true };
        }
        globalSystem.houseManager.pushItem(item, false, false);
        return { end: false, next: true };
    }

    pushItemHouseUnique(data, survivor, stage)
    {
        if (globalSystem.questManager.isReplay)
        {
            return { end: false, next: true };
        }

        var already = globalSystem.houseManager.getItemById(data.arg0);
        if (already != null)
        {
            return { end: false, next: true };
        }

        var item = globalSystem.itemData.getDataById(data.arg0);
        if (item == null)
        {
            return { end: false, next: true };
        }
        globalSystem.houseManager.pushItem(item, false, false);
        return { end: false, next: true };
    }

    equipWeapon(data, survivor, stage)
    {
        if (globalSystem.questManager.isReplay)
        {
            return { end: false, next: true };
        }

        var item = survivor.getItemById(data.arg0);
        if (item == null)
        {
            return { end: false, next: true };
        }
        survivor.equipWeapon(item);
        return { end: false, next: true };
    }

    appendSurvivor(data, survivor, stage)
    {
        if (globalSystem.questManager.isReplay)
        {
            return { end: false, next: true };
        }

        var index = globalSystem.survivorManager.survivors.length;
        if (index >= globalSystem.survivorManager.survivorMax)
        {
            return { end: false, next: true };
        }

        var exist = globalSystem.survivorManager.getSurvivorById(data.arg0);
        if (exist)
        {
            return { end: false, next: true };
        }

        var data = globalSystem.survivorData.getDataById(data.arg0);
        var newSurvivor = new Survivor(index, data);
        globalSystem.survivorManager.pushSurvivor(newSurvivor);
        return { end: false, next: true };
    }

    removeSurvivor(data, survivor, stage)
    {
        if (globalSystem.questManager.isReplay)
        {
            return { end: false, next: true };
        }

        var target = globalSystem.survivorManager.removeSurvivor(data.arg0);
        if (target != null)
        {
            if (target.currentEvent == this)
            {
                var main = globalSystem.survivorManager.mainSurvivor;
                if (main != null)
                {
                    this.isExecuting = false;
                    this.target = main;
                    main.setStage(stage);
                    main.insertEvent(this, Event.executeType.event);

                    this.index++;
                    return { end: true, next: false };
                }
            }
        }
        return { end: false, next: true };
    }

    setupTextLine(data, survivor, stage)
    {
        TalkEvent.setupUI();
        var setupFg = Type.toBoolean(data.arg0);
        if (setupFg)
        {
            TalkEvent.setupForeground();
        }
        return { end: false, next: true };
    }

    fadeInTextLine(data, survivor, stage)
    {
        var time = 0;
        if (data.arg0 != null)
        {
            time = parseFloat(data.arg0);
        }

        if (this.timer == 0)
        {
            var length = globalSystem.survivorManager.survivors.length;
            for (var i = 0; i < length; i++)
            {
                globalSystem.uiManager.textLine[i].fadeIn(time);
            }
        }

        if (this.timer < time)
        {
            this.timer += globalSystem.time.deltaTime;
            return { end: false, next: false };
        }

        this.timer = 0;
        return { end: false, next: true };
    }

    fadeOutTextLine(data, survivor, stage)
    {
        var time = 1.0;
        if (data.arg0 != null)
        {
            time = parseFloat(data.arg0);
        }

        if (this.timer == 0)
        {
            var length = globalSystem.survivorManager.survivors.length;
            for (var i = 0; i < length; i++)
            {
                globalSystem.uiManager.textLine[i].fadeOut(time);
            }
        }

        if (this.timer < time)
        {
            this.timer += globalSystem.time.deltaTime;
            return { end: false, next: false };
        }

        this.timer = 0;
        return { end: false, next: true };
    }

    fadeOverlay(data, survivor, stage)
    {
        var id = data.arg0;
        var layer = parseInt(data.arg1);
        var time = parseFloat(data.arg2);
        globalSystem.uiManager.overlay.fadeIn(id, layer, time);
        return { end: false, next: true };
    }

    clearOverlay(data, survivor, stage)
    {
        globalSystem.uiManager.overlay.clear();
        return { end: false, next: true };
    }

    disableInputHistory(data, survivor, stage)
    {
        globalSystem.textInputManager.disableHistory();
        return { end: false, next: true };
    }

    event(data, survivor, stage)
    {
        var id = data.arg0;
        var event = EventGenerator.generateById(id);
        if (event == null)
        {
            return { end: false, next: true };
        }

        survivor.insertEvent(event, Event.executeType.event);
        survivor.pushEvent(this, Event.executeType.event);

        this.index++;

        return { end: true, next: false };
    }

    end(data, survivor, stage)
    {
        switch (data.arg0)
        {
            case "continue":
                {
                    break;
                }
            case "questStart":
                {
                    for (var s of globalSystem.survivorManager.survivors)
                    {
                        var isMain = (s == globalSystem.survivorManager.validSurvivor);
                        s.pushEvent(new QuestStartEvent(isMain, null), Event.executeType.event);
                    }
                    break;
                }
            case "questSuccess":
                {
                    survivor.pushEvent(new QuestSuccessEvent(false), Event.executeType.event);
                    break;
                }
            case "questFailed":
                {
                    survivor.pushEvent(new QuestFailedEvent(false, 0), Event.executeType.event);
                    break;
                }
            case "nextLocation":
                {
                    var quest = globalSystem.questManager.currentQuest;
                    var scenario = globalSystem.questManager.currentScenario;
                    if (scenario != null && scenario.prevQuest != null)
                    {
                        quest = scenario.prevQuest;
                        scenario = scenario.prevScenario;
                    }
                    survivor.pushEvent(new NextLocationEvent(quest, scenario, false, false), Event.executeType.event);
                    break;
                }
            case "ending":
                {
                    var id = data.arg1;
                    survivor.pushEvent(new EndingEvent(id), Event.executeType.event);
                    break;
                }
            case "endroll":
                {
                    var type = data.arg1;
                    globalSystem.flowManager.setFlow(new EndrollFlow(type));
                    break;
                }
            case "rebootNoSave":
                {
                    globalSystem.flowManager.setFlow(new SplashFlow());
                    break;
                }
            case "reboot":
                {
                    globalSystem.flowManager.setFlow(new RebootFlow());
                    break;
                }
            default:
                break;
        }

        this.onExecuteEnd(survivor, stage);

        return { end: true, next: false };
    }

    memo(data, survivor, stage)
    {
        console.log(data.arg0);
        return { end: false, next: true };
    }

    onExecuteEnd(survivor, stage)
    {
        survivor.ignoreCostume(false);
    }

    getUseStamina()
    {
        return 0;
    }

    isContinuable()
    {
        return true;
    }
}
