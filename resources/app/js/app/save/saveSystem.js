class SaveSystem
{
    static get systemVersion()
    {
        return 0;
    }

    static get appVersion()
    {
        return 0;
    }

    static get systemSaveKey()
    {
        if (TestSwitch.enabled)
        {
            return `system-save-${TestSwitch.version}`;
        }
        return "system-save";
    }

    static get appSaveKey()
    {
        if (TestSwitch.enabled)
        {
            return `app-save-${TestSwitch.version}`;
        }
        return "app-save";
    }

    static get key()
    {
        var result =
        {
            systemVersion: "system-saveVersion",
            bgmVolume: "system-bgmVolume",
            seVolume: "system-seVolume",
            fontSize: "system-fontSize",
            animationCut: "system-animationCut",
            windowSize: "system-windowSize",
            fullscreen: "system-fullscreen",
            textWait: "system-textWait",
            textAuto: "system-textAuto",
            textAutoWaitType: "system-textAutoWaitType",
            textAutoStop: "system-textAutoStop",
            gameMode: "system-gameMode",
            elapsedTime: "system-elapsedTime",

            appVersion: "app-saveVersion",
            survivors: "app-survivors",
            inventory: "app-inventroy_{0}",
            inventoryVariables: "app-inventoryVariables_{0}",
            inventoryAccessorys: "app-inventoryAccessorys_{0}",
            weapon: "app-weapon_{0}",
            armor: "app-armor_{0}",
            openScenarioDate: "app-openScenarioDate",
            finishScenarioDate: "app-finishScenarioDate",
            finishScenario: "app-finishScenario",
            finishSubScenario: "app-finishSubScenario",
            storyScenario: "app-storyScenario",
            playedQuestToScenario: "app-playedQuestToScenario",
            playedQuestProgressToScenario: "app-playedQuestProgressToScenario",
            playedQuestTimesToScenario: "app-playedQuestTimesToScenario",
            visitedLocationsToScenario: "app-visitedDateLocationsToScenario",
            houseItem: "app-houseItem",
            houseItemVariables: "app-houseItemVariables",
            houseItemAccessorys: "app-houseItemAccessorys",
            finishQuest: "app-finishQuest",
            openedItem: "app-openedItem",
            openedCraft: "app-openedCraft",
            finishedChat: "app-finishedChat",
            openedLocations: "app-openedLocations",
            areaGroups: "app-areaGroups",
            finishedTutorials: "app-finishedTutorials",
            finishedPresents: "app-finishedPresents",
            finishedDatePresents: "app-finishedDatePresents",
            flags: "app-flags",
            baseCampCount: "app-baseCampCount",
            nextDestination: "app-nextDestination",
            nextDestinationCount: "app-nextDestinationCount",
        };
        return result;
    }

    static save()
    {
        SaveSystem.saveSystem();
        SaveSystem.saveApp();
    }

    static saveSystem()
    {
        var system = new SaveData(SaveSystem.systemSaveKey, SaveSystem.convertData);
        system.saveItem(SaveSystem.key.systemVersion, null, SaveSystem.systemVersion);
        system.saveItem(SaveSystem.key.bgmVolume, null, globalSystem.soundManager.bgmVolumeIndex);
        system.saveItem(SaveSystem.key.seVolume, null, globalSystem.soundManager.seVolumeIndex);
        system.saveItem(SaveSystem.key.fontSize, null, GraphicsSetting.fontSizeIndex);
        system.saveItem(SaveSystem.key.animationCut, null, GraphicsSetting.isAnimationCut);
        system.saveItem(SaveSystem.key.gameMode, null, GameModeSetting.currentMode);
        system.saveItem(SaveSystem.key.windowSize, null, globalSystem.uiManager.window.currentSizeIndex);
        system.saveItem(SaveSystem.key.fullscreen, null, globalSystem.uiManager.window.isFullscreen);
        system.saveItem(SaveSystem.key.textWait, null, globalSystem.textLineManager.textWaitTimeIndex);
        system.saveItem(SaveSystem.key.textAuto, null, globalSystem.textAutoManager.isAuto);
        system.saveItem(SaveSystem.key.textAutoWaitType, null, globalSystem.textAutoManager.waitType.index);
        system.saveItem(SaveSystem.key.textAutoStop, null, globalSystem.textAutoManager.stopOnScenario);
        system.saveItem(SaveSystem.key.elapsedTime, null, globalSystem.time.elapsedTime);
        system.save();
    }

    static saveApp()
    {
        var app = new SaveData(SaveSystem.appSaveKey, SaveSystem.convertData);
        app.saveItem(SaveSystem.key.appVersion, null, SaveSystem.appVersion);
        app.saveArrayItem(SaveSystem.key.survivors, null, globalSystem.survivorManager.survivors, ["id"]);
        for (var i = 0; i < globalSystem.survivorManager.survivorMax; i++)
        {
            var weapon = null;
            var armor = null;
            var tool = null;
            var inventory = null;

            if (i < globalSystem.survivorManager.survivors.length)
            {
                var survivor = globalSystem.survivorManager.survivors[i];
                if (survivor.weapon != null)
                {
                    weapon = survivor.weapon.id;
                }
                if (survivor.armor != null)
                {
                    armor = survivor.armor.id;
                }
                inventory = survivor.inventory.list;
            }
            app.saveItem(SaveSystem.key.weapon, i, weapon);
            app.saveItem(SaveSystem.key.armor, i, armor);
            app.saveArrayItem(SaveSystem.key.inventory, i, inventory, ["id"]);
            app.saveArrayItem(SaveSystem.key.inventoryVariables, i, inventory, ["variable"]);
            app.saveArrayItem(SaveSystem.key.inventoryAccessorys, i, inventory, ["accessory", "id"]);
        }
        app.saveArrayItem(SaveSystem.key.openScenarioDate, null, globalSystem.scenarioManager.openDate);
        app.saveArrayItem(SaveSystem.key.finishScenarioDate, null, globalSystem.scenarioManager.finishDate);
        app.saveArrayItem(SaveSystem.key.finishScenario, null, globalSystem.scenarioManager.finishId);
        app.saveArrayItem(SaveSystem.key.finishSubScenario, null, globalSystem.scenarioManager.finishSubId);
        app.saveItem(SaveSystem.key.storyScenario, null, globalSystem.scenarioManager.temporaryScenarioId);
        app.saveArrayItem(SaveSystem.key.houseItem, null, globalSystem.houseManager.items, ["id"]);
        app.saveArrayItem(SaveSystem.key.houseItemVariables, null, globalSystem.houseManager.items, ["variable"]);
        app.saveArrayItem(SaveSystem.key.houseItemAccessorys, null, globalSystem.houseManager.items, ["accessory", "id"]);
        app.saveArrayItem(SaveSystem.key.openedItem, null, globalSystem.houseManager.openedItem);
        app.saveArrayItem(SaveSystem.key.openedCraft, null, globalSystem.houseManager.openedCraft);
        app.saveArrayItem(SaveSystem.key.finishQuest, null, globalSystem.questManager.finishedQuest);
        app.saveItem(SaveSystem.key.playedQuestToScenario, null, globalSystem.questManager.playedQuestCount);
        app.saveItem(SaveSystem.key.playedQuestProgressToScenario, null, globalSystem.questManager.playedQuestProgressMax);
        app.saveItem(SaveSystem.key.playedQuestTimesToScenario, null, globalSystem.questManager.playedQuestTimes);
        app.saveArrayItem(SaveSystem.key.visitedLocationsToScenario, null, globalSystem.questManager.visitedLocations);
        app.saveArrayItem(SaveSystem.key.finishedChat, null, globalSystem.eventManager.finishedChat);
        app.saveArrayItem(SaveSystem.key.openedLocations, null, globalSystem.areaManager.openedLocations);
        app.saveArrayItem(SaveSystem.key.areaGroups, null, globalSystem.areaManager.currentGroups);
        app.saveArrayItem(SaveSystem.key.finishedTutorials, null, globalSystem.tutorialManager.finishedIds);
        app.saveArrayItem(SaveSystem.key.finishedPresents, null, globalSystem.presentManager.finishedIds);
        app.saveArrayItem(SaveSystem.key.finishedDatePresents, null, globalSystem.presentManager.finishedDate);
        app.saveArrayItem(SaveSystem.key.flags, null, globalSystem.flagManager.flags);
        app.saveItem(SaveSystem.key.baseCampCount, null, globalSystem.endlessManager.baseCampCount);
        app.saveItem(SaveSystem.key.nextDestination, null, globalSystem.endlessManager.nextDestination);
        app.saveItem(SaveSystem.key.nextDestinationCount, null, globalSystem.endlessManager.nextDestinationCount);
        app.save();
    }

    static load()
    {
        SaveSystem.loadSystem();
        SaveSystem.loadApp();
    }

    static loadSystem()
    {
        var system = new SaveData(SaveSystem.systemSaveKey, SaveSystem.convertData);
        if (system.load())
        {
            var version = system.loadItem(SaveSystem.key.systemVersion, null, null);
            if (version == SaveSystem.systemVersion)
            {
                globalSystem.soundManager.setBgmVolumeIndex(system.loadItem(SaveSystem.key.bgmVolume, null, 0));
                globalSystem.soundManager.setSeVolumeIndex(system.loadItem(SaveSystem.key.seVolume, null, 0));
                GraphicsSetting.setFontSize(system.loadItem(SaveSystem.key.fontSize, null, 0));
                GraphicsSetting.animationCut(system.loadItem(SaveSystem.key.animationCut, null, false));
                GameModeSetting.setMode(system.loadItem(SaveSystem.key.gameMode, null, GameModeSetting.mode.invalid));
                globalSystem.uiManager.window.setWindowSize(system.loadItem(SaveSystem.key.windowSize, null, 0));
                globalSystem.uiManager.window.setFullscreen(system.loadItem(SaveSystem.key.fullscreen, null, false));
                globalSystem.textLineManager.setTextWaitTime(system.loadItem(SaveSystem.key.textWait, null, 0));
                globalSystem.textAutoManager.setAuto(system.loadItem(SaveSystem.key.textAuto, null, false));
                globalSystem.textAutoManager.setWaitType(system.loadItem(SaveSystem.key.textAutoWaitType, null, 0));
                globalSystem.textAutoManager.setStopOnScenario(system.loadItem(SaveSystem.key.textAutoStop, null, true));
                globalSystem.time.setElapsedTime(system.loadItem(SaveSystem.key.elapsedTime, null, 0));
            }
            else
            {
                system.clear();
            }
        }
    }

    static loadApp()
    {
        var app = new SaveData(SaveSystem.appSaveKey, SaveSystem.convertData);
        if (app.load())
        {
            var version = app.loadItem(SaveSystem.key.appVersion, null, null);
            if (version == SaveSystem.appVersion)
            {
                globalSystem.survivorManager.survivors = [];
                var survivors = app.loadArrayItem(SaveSystem.key.survivors, null, (id) => { return globalSystem.survivorData.getDataById(id); });
                if (survivors != null)
                {
                    for (var i = 0; i < survivors.length; i++)
                    {
                        globalSystem.survivorManager.pushSurvivor(new Survivor(i, survivors[i]));
                    }
                }

                for (var i = 0; i < globalSystem.survivorManager.survivors.length; i++)
                {
                    var survivor = globalSystem.survivorManager.survivors[i];
                    survivor.inventory.list = app.loadArrayItem(SaveSystem.key.inventory, i, (id) => { return globalSystem.itemData.getDataById(id); });
                    var itemVariables = app.loadArrayItem(SaveSystem.key.inventoryVariables, i);
                    var itemAccessorys = app.loadArrayItem(SaveSystem.key.inventoryAccessorys, i);
                    for (var j = 0; j < survivor.inventory.list.length; j++)
                    {
                        var item = survivor.inventory.list[j];
                        if (item == null)
                        {
                            continue;
                        }
                        if (j < itemVariables.length)
                        {
                            item.variable = itemVariables[j];
                        }
                        if (j < itemAccessorys.length)
                        {
                            item.accessory = globalSystem.itemAccessoryData.getDataById(itemAccessorys[j]);
                        }
                    }
                    survivor.weapon = app.loadItem(SaveSystem.key.weapon, i, null, (id) => { return survivor.getItemById(id); });
                    survivor.armor = app.loadItem(SaveSystem.key.armor, i, null, (id) => { return survivor.getItemById(id); });
                }
                globalSystem.scenarioManager.openDate = app.loadArrayItem(SaveSystem.key.openScenarioDate, null);
                globalSystem.scenarioManager.finishDate = app.loadArrayItem(SaveSystem.key.finishScenarioDate, null);
                globalSystem.scenarioManager.finishId = app.loadArrayItem(SaveSystem.key.finishScenario, null);
                globalSystem.scenarioManager.finishSubId = app.loadArrayItem(SaveSystem.key.finishSubScenario, null);
                globalSystem.scenarioManager.temporaryScenarioId = app.loadItem(SaveSystem.key.storyScenario, null, null);
                globalSystem.houseManager.items = app.loadArrayItem(SaveSystem.key.houseItem, null, (id) => { return globalSystem.itemData.getDataById(id); });
                var houseVariables = app.loadArrayItem(SaveSystem.key.houseItemVariables, null);
                var houseAccessorys = app.loadArrayItem(SaveSystem.key.houseItemAccessorys, null);
                for (var j = 0; j < globalSystem.houseManager.items.length; j++)
                {
                    var item = globalSystem.houseManager.items[j];
                    if (item == null)
                    {
                        continue;
                    }
                    if (j < houseVariables.length)
                    {
                        item.variable = houseVariables[j];
                    }
                    if (j < houseAccessorys.length)
                    {
                        item.accessory = globalSystem.itemAccessoryData.getDataById(houseAccessorys[j]);
                    }
                }

                globalSystem.houseManager.openedItem = app.loadArrayItem(SaveSystem.key.openedItem, null);
                globalSystem.houseManager.openedCraft = app.loadArrayItem(SaveSystem.key.openedCraft, null);
                globalSystem.questManager.finishedQuest = app.loadArrayItem(SaveSystem.key.finishQuest, null);
                globalSystem.questManager.playedQuestCount = app.loadItem(SaveSystem.key.playedQuestToScenario, null, 0);
                globalSystem.questManager.playedQuestProgressMax = app.loadItem(SaveSystem.key.playedQuestProgressToScenario, null, 0);
                globalSystem.questManager.playedQuestTimes = app.loadItem(SaveSystem.key.playedQuestTimesToScenario, null, 0);
                globalSystem.questManager.visitedLocations = app.loadArrayItem(SaveSystem.key.visitedLocationsToScenario, null);
                globalSystem.eventManager.finishedChat = app.loadArrayItem(SaveSystem.key.finishedChat, null);
                globalSystem.areaManager.openedLocations = app.loadArrayItem(SaveSystem.key.openedLocations, null);
                globalSystem.areaManager.currentGroups = app.loadArrayItem(SaveSystem.key.areaGroups, null);
                globalSystem.tutorialManager.finishedIds = app.loadArrayItem(SaveSystem.key.finishedTutorials, null);
                globalSystem.presentManager.finishedIds = app.loadArrayItem(SaveSystem.key.finishedPresents, null);
                globalSystem.presentManager.finishedDate = app.loadArrayItem(SaveSystem.key.finishedDatePresents, null);
                globalSystem.flagManager.flags = app.loadArrayItem(SaveSystem.key.flags, null);
                globalSystem.endlessManager.baseCampCount = app.loadItem(SaveSystem.key.baseCampCount, null, 0);
                globalSystem.endlessManager.nextDestination = app.loadItem(SaveSystem.key.nextDestination, null, null);
                globalSystem.endlessManager.nextDestinationCount = app.loadItem(SaveSystem.key.nextDestinationCount, null, 0);
            }
            else
            {
                app.clear();
            }
        }
    }

    static clearApp()
    {
        var app = new SaveData(SaveSystem.appSaveKey, SaveSystem.convertData);
        app.clear();
    }

    static copyToClipboard()
    {
        var system = new SaveData(SaveSystem.systemSaveKey, SaveSystem.convertData);
        system.load();
        var systemStr = system.getDataStr();

        var app = new SaveData(SaveSystem.appSaveKey, SaveSystem.convertData);
        app.load();
        var appStr = app.getDataStr();

        var str = `${systemStr}\n${appStr}`;
        navigator.clipboard.writeText(str);
    }

    static writeSave(key, str)
    {
        localStorage.setItem(key, str);
    }

    static convertData(key, data)
    {
        for (var convertData of globalSystem.saveConvertData.datas[0])
        {
            if (key.indexOf(convertData.key) == -1)
            {
                continue;
            }
            if (data == convertData.from)
            {
                return convertData.to;
            }
        }
        return data;
    }
}
