class DIPSwitch
{
    static textbox = null;

    static get elementId()
    {
        return "dipSwitch";
    }

    static setup()
    {
        if (Platform.isMaster)
        {
            return;
        }

        var window = document.getElementById("wrapper");

        var button = document.createElement("div");
        button.style.zIndex = 999;
        button.style.position = "relative";
        button.style.width = "5%";
        button.style.height = "5%";
        button.style.whiteSpace = "nowrap";
        button.id = DIPSwitch.elementId;
        button.onclick = DIPSwitch.show;
        window.appendChild(button);
    }

    static show(event)
    {
        if (event.target.id != DIPSwitch.elementId)
        {
            return;
        }

        var dip = document.getElementById(DIPSwitch.elementId);
        if (dip.children.length > 0)
        {
            return;
        }
        var index = 0;
        DIPSwitch.createTextbox(dip);
        DIPSwitch.createButton(dip, index++, "CLOSE", (e) => { DIPSwitch.close(e); });
        DIPSwitch.createButton(dip, index++, "TESTモード有効", (e) => { TestSwitch.enable(); });
        DIPSwitch.createButton(dip, index++, "Eruda 起動", (e) => { DIPSwitch.initEruda(e.target); });
        DIPSwitch.createButton(dip, index++, "Platform出力", (e) => { console.log(Platform.userAgent); });
        DIPSwitch.createButton(dip, index++, "再生済クエスト数を10に", (e) => { globalSystem.questManager.playedQuestCount = 10; });
        DIPSwitch.createButton(dip, index++, "タイムスケール1倍", (e) => { globalSystem.time.scale = 1; });
        DIPSwitch.createButton(dip, index++, "タイムスケール10倍", (e) => { globalSystem.time.scale *= 10; });
        DIPSwitch.createButton(dip, index++, "シナリオイベント実行", (e) => { DIPSwitch.executeScenario(); });
        DIPSwitch.createButton(dip, index++, "シナリオ概要の表示を上書き", (e) => { DIPSwitch.overwriteStoryScenario(); });
        DIPSwitch.createButton(dip, index++, "アイテム入手", (e) => { DIPSwitch.getItem(); });
        DIPSwitch.createButton(dip, index++, "アイテム入手（ランダム）", (e) => { DIPSwitch.getItemRandom(); });
        DIPSwitch.createButton(dip, index++, "すべてのアイテム入手", (e) => { DIPSwitch.getItemAll(); });
        DIPSwitch.createButton(dip, index++, "倉庫を空に", (e) => { DIPSwitch.resetHouseItem(); });
        DIPSwitch.createButton(dip, index++, "戦闘イベント発生", (e) => { DIPSwitch.setBattleEvent(); });
        DIPSwitch.createButton(dip, index++, "セーブデータをクリップボードにコピー", (e) => { SaveSystem.copyToClipboard(); });
        DIPSwitch.createButton(dip, index++, "Appセーブデータを上書き", (e) => { DIPSwitch.writeSaveApp(); });
        DIPSwitch.createButton(dip, index++, "カメラアニメーション", (e) => { DIPSwitch.requestCameraEffect(); });
        DIPSwitch.createButton(dip, index++, "任意イベント発行", (e) => { DIPSwitch.pushEvent(); });
        DIPSwitch.createButton(dip, index++, "レシピ開放フラグをクリア", (e) => { globalSystem.houseManager.clearOpenCraft(); });
        DIPSwitch.createButton(dip, index++, "次のロケーション生成テスト", (e) => { DIPSwitch.testNextLocation(); });
        DIPSwitch.createButton(dip, index++, "次のロケーションを設定", (e) => { DIPSwitch.requestNextLocation(); });
        DIPSwitch.createButton(dip, index++, "シナリオ進行条件をスキップ", (e) => { globalSystem.scenarioManager.skipCondition = true; });
        DIPSwitch.createButton(dip, index++, "チュートリアルを開く", (e) => { DIPSwitch.openTutorial(); });
        DIPSwitch.createButton(dip, index++, "プレゼントを配布", (e) => { DIPSwitch.givePresent(); });
        DIPSwitch.createButton(dip, index++, "AutoPlay再生/停止", (e) => { AutoPlayExecutor.switch(); });
        DIPSwitch.createButton(dip, index++, "AutoPlay「帰る」禁止", (e) => { AutoPlayQuest.bunReturn = true; });
    }

    static close(event)
    {
        var dip = document.getElementById(DIPSwitch.elementId);
        var elements = dip.children;
        for (var i = elements.length - 1; i >= 0; i--)
        {
            elements[i].remove();
        }
    }

    static createButton(parent, index, text, onclick)
    {
        var button = document.createElement("button");
        button.innerText = text;
        button.style.zIndex = 999;
        button.style.position = "relative";
        button.onclick = onclick;
        parent.appendChild(button);

        if (index % 5 == 0)
        {
            parent.appendChild(document.createElement("br"));
        }
    }

    static createTextbox(parent)
    {
        var textbox = document.createElement("input");
        textbox.type = "text";
        textbox.style.fontSize = "24px";
        textbox.style.zIndex = 999;
        textbox.style.position = "relative";
        parent.appendChild(textbox);

        parent.appendChild(document.createElement("br"));

        DIPSwitch.textbox = textbox;
    }

    static executeScenario()
    {
        var input = DIPSwitch.textbox.value;
        var data = globalSystem.scenarioData.getDataById(input);
        if (data == null)
        {
            return;
        }
        ScenarioExecutor.executeScenario(data, null, null);
    }

    static overwriteStoryScenario()
    {
        var input = DIPSwitch.textbox.value;
        var data = globalSystem.scenarioData.getDataById(input);
        if (data == null)
        {
            return;
        }
        var flow = new StoryFlow();
        flow.overwriteScenario = data;
        globalSystem.flowManager.setFlow(flow);
    }

    static getItem()
    {
        var input = DIPSwitch.textbox.value;
        var item = globalSystem.itemData.getDataById(input);
        if (item == null)
        {
            return;
        }
        globalSystem.houseManager.pushItem(item);
        globalSystem.uiManager.house.updateItems();
    }

    static getItemRandom()
    {
        var item = globalSystem.itemData.getRandom(999);
        if (item == null)
        {
            return;
        }
        globalSystem.houseManager.pushItem(item);
        globalSystem.uiManager.house.updateItems();
    }

    static getItemAll()
    {
        var length = globalSystem.itemData.getLength(0);
        for (var i = 0; i < length; i++)
        {
            var data = globalSystem.itemData.getDataByIndex(0, i);
            var item = globalSystem.itemData.getDataById(data.id);
            if (item == null)
            {
                continue;
            }
            globalSystem.houseManager.pushItem(item);
        }
        globalSystem.uiManager.house.updateItems();
    }

    static resetHouseItem()
    {
        globalSystem.houseManager.removeAllItems();
        globalSystem.uiManager.house.updateItems();
    }

    static initEruda(element)
    {
        var script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/eruda/1.4.3/eruda.min.js";
        script.onload = function ()
        {
            eruda.init();
            console.log('eruda init.');
        };
        element.appendChild(script);
    }

    static setBattleEvent()
    {
        var data = ["encount", "stage"];
        var battle = new BattleEvent(data);
        globalSystem.survivorManager.validSurvivor.pushEvent(battle, Event.executeType.stage);
    }

    static requestCameraEffect()
    {
        var input = DIPSwitch.textbox.value;
        globalSystem.cameraManager.request(input);
    }

    static pushEvent()
    {
        var input = DIPSwitch.textbox.value;
        var event = EventGenerator.generateById(input);
        if (event == null)
        {
            return true;
        }
        globalSystem.survivorManager.validSurvivor.pushEvent(event, Event.executeType.stage);
    }

    static writeSaveApp()
    {
        var input = DIPSwitch.textbox.value;
        SaveSystem.writeSave(SaveSystem.appSaveKey, input);
        document.location.reload();
    }

    static testNextLocation()
    {
        var location = globalSystem.locationManager.location.id;
        var count = 3;
        var correct = [];
        for (var i = 0; i < 1000; i++)
        {
            if (correct.indexOf(location) == -1)
            {
                correct.push(location);
            }
            var result = globalSystem.areaManager.getNextLocations(count, location);
            var index = Random.range(result.length);
            location = result[index].id;
        }

        var allLocations = globalSystem.areaManager.getAreaLocations();
        console.log(`all locations count = ${allLocations.length}`);
        console.log(`correct locations count = ${correct.length}`);
        for (var location of allLocations)
        {
            if (correct.indexOf(location.location) == -1)
            {
                console.log(`not correct = ${location.location}`);
            }
        }
    }

    static requestNextLocation()
    {
        var input = DIPSwitch.textbox.value;
        globalSystem.areaManager.overwriteCurrentLocation = input;
    }

    static openTutorial()
    {
        var input = DIPSwitch.textbox.value;
        var data = globalSystem.tutorialData.getDataById(input);
        globalSystem.tutorialManager.open(data);
    }

    static givePresent()
    {
        var input = DIPSwitch.textbox.value;
        var data = globalSystem.presentData.getDataById(input);
        globalSystem.presentManager.give(data, "dip");
    }
}

DIPSwitch.setup();
