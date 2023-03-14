class ExprolerWindow extends UIElement
{
    constructor()
    {
        super("exproler");
        this.currentDate = 0;
        this.currentArea = null;
        this.currentLocation = null;
        this.currentStoryTargetDescription = null;

        this.storyTarget = null;
        this.path = null;
        this.backButton = null;
        this.list = null;
        this.detail = null;
    }

    static get locationCountMax()
    {
        return 300;
    }

    static get icon()
    {
        var result =
        {
            folder: 0,
            folder_emphasis: 1,
            folder_disable: 2,
            log: 3,
            recovery: 4,
        };
        return result;
    }

    setup()
    {
        this.storyTarget = document.getElementById("exprolerStoryTarget");
        this.path = document.getElementById("exprolerPath");
        this.backButton = document.getElementById("exprolerBack");
        this.backButton.onclick = this.back;
        this.list = document.getElementById("exprolerList");
        this.detail = null;

        this.storyTarget.onclick = (event) =>
        {
            this.openStoryTargetDescription();
        };
    }

    update()
    {
    }

    setupLayout()
    {
        this.showDate();
    }

    applyPath()
    {
        this.backButton.style.display = "none";
        this.storyTarget.style.display = "none";

        var path = Terminology.get("exproler_path");
        if (this.currentDate != -1)
        {
            //path += `${globalSystem.exprolerData.getDataByDate(this.currentDate).text} / `;
            this.backButton.style.display = "inline";
            this.storyTarget.style.display = "inline";
        }
        if (this.currentArea != null)
        {
            //path += `${globalSystem.areaData.getDataById(this.currentArea.area).name} / `;
            this.backButton.style.display = "inline";
            this.storyTarget.style.display = "inline";
        }
        this.path.innerHTML = path;
    }

    addItem(icon, text, onClick, isInsertTop = false)
    {
        var box = document.createElement("div");
        box.style.display = "block";
        box.style.position = "relative";
        box.style.width = "100%";
        box.style.height = "15%";
        box.style.marginTop = "3%";
        box.style.marginBottom = "4%";

        var image = document.createElement("img");
        image.style.position = "absolute";
        image.style.top = "20%";
        image.style.width = "7%";
        image.style.height = "80%";
        box.appendChild(image);

        var button = document.createElement("button");
        button.innerHTML = text;
        button.className = "app";
        button.style.position = "absolute";
        button.style.width = "70%";
        button.style.height = "60%";
        button.style.left = "12%";
        button.style.textAlign = "left";
        button.style.boxSizing = "content-box";
        button.style.padding = "2% 2% 2% 2%";
        button.style.margin = "0.5% 3% 0.5% 3%";
        button.onclick = onClick;
        box.appendChild(button);

        switch (icon)
        {
            case ExprolerWindow.icon.folder:
                image.src = "resources/image/folder00.png";
                break;
            case ExprolerWindow.icon.folder_emphasis:
                image.src = "resources/image/folder00.png";
                var emphasis = document.createElement("img");
                emphasis.src = "resources/image/emphasis00.png";
                emphasis.style.position = "absolute";
                emphasis.style.top = "10%";
                emphasis.style.left = "5%";
                emphasis.style.width = "4.5%";
                emphasis.style.height = "50%";
                box.appendChild(emphasis);
                break;
            case ExprolerWindow.icon.folder_disable:
                image.src = "resources/image/folder01.png";
                button.style.color = Color.gray;
                break;
            case ExprolerWindow.icon.log:
                image.src = "resources/image/log00.png";
                button.style.color = Color.gray;
                break;
            case ExprolerWindow.icon.recovery:
                image.src = "resources/image/log00.png";
                button.style.color = Color.darkGreen;
                break;
            default:
                break;
        }

        if (isInsertTop)
        {
            this.list.prepend(box);
        }
        else
        {
            this.list.appendChild(box);
        }
    }

    clearItem()
    {
        this.list.innerHTML = "";
        this.list.scrollTop = 0;
    }

    showDate()
    {
        this.currentDate = -1;
        this.currentArea = null;
        this.currentLocation = null;
        this.applyPath();
        this.clearItem();

        var opened = globalSystem.scenarioManager.openDate;
        for (var i = 0; i < opened.length; i++)
        {
            var date = String(opened[i]);
            var data = globalSystem.exprolerData.getDataByDate(date);
            if (data == null)
            {
                continue;
            }

            if (StringExtension.isValid(data.requireScenario))
            {
                var finishedScenario = globalSystem.scenarioManager.isFinished(data.requireScenario);
                if (finishedScenario == false)
                {
                    continue;
                }
            }

            var dateId = date;
            var finished = (globalSystem.scenarioManager.finishDate.indexOf(date) >= 0);
            var name = data.text;
            var onclick = null;
            var icon = ExprolerWindow.icon.folder;
            if (finished)
            {
                name += Terminology.get("exproler_completed");
                icon = ExprolerWindow.icon.folder_disable;
            }
            else
            {
                onclick = function (window, id)
                {
                    return function ()
                    {
                        window.currentDate = id;
                        window.showArea(id);
                    };
                }(this, dateId);
            }
            this.addItem(icon, name, onclick, !finished);
        }
    }

    showArea(date)
    {
        this.currentArea = null;
        this.currentLocation = null;
        this.applyPath();
        this.clearItem();

        var quest = globalSystem.questData.getDataByDate(date);
        if (quest == null)
        {
            return;
        }

        var area = quest.area;
        var group = globalSystem.areaManager.getGroup(area);
        var areaLocations = globalSystem.areaData.getAreaLocations(area, group);

        var opend = [];
        var closed = List.duplicate(areaLocations);
        var opendLocations = globalSystem.areaManager.getOpenedLocations(area);
        for (var i = opendLocations.length - 1; i >= 0; i--)
        {
            var opendLocation = opendLocations[i];
            for (var areaLocation of areaLocations)
            {
                if (areaLocation.location == opendLocation)
                {
                    opend.push(areaLocation);
                    closed = List.remove(closed, areaLocation);
                    break;
                }
            }
        }
        areaLocations = opend.concat(closed);

        var locationCount = 0;
        for (var areaLocation of areaLocations)
        {
            var isStart = Type.toBoolean(areaLocation.start);
            if (isStart == false)
            {
                continue;
            }

            const locationData = globalSystem.locationData.getDataById(areaLocation.location);
            if (locationData == null)
            {
                continue;
            }

            var isDefault = Type.toBoolean(areaLocation.default);
            if (isDefault == false)
            {
                var isOpened = globalSystem.areaManager.isOpenedLocation(area, locationData.id);
                if (isOpened == false)
                {
                    continue;
                }
            }

            var locationName = locationData.name;
            this.addItem(ExprolerWindow.icon.folder, locationName, () =>
            {
                this.currentArea = quest;
                this.currentLocation = locationData;
                this.showLog(date, quest, locationData);
            });

            locationCount++;
            if (locationCount >= Number(quest.startlocationCount))
            {
                break;
            }
        }

        this.storyTarget.innerHTML = "";
        if (StringExtension.isValid(quest.description))
        {
            this.storyTarget.innerHTML = quest.target;
            this.currentStoryTargetDescription = quest.description;
            if (quest.area == AreaManager.area.endless)
            {
                this.currentStoryTargetDescription += globalSystem.endlessManager.getEndlessInfo();
            }
        }
        else
        {
            var scenario = globalSystem.scenarioManager.getLastScenario(date);
            if (scenario != null)
            {
                var target = ScenarioExecutor.getScenarioTarget(scenario);
                this.storyTarget.innerHTML = target.target;
                this.currentStoryTargetDescription = target.description;
            }
        }
    }

    showLog(date, questData, locationData)
    {
        this.applyPath();
        this.clearItem();

        var finishedDate = globalSystem.scenarioManager.finishDate;
        if (finishedDate.indexOf(this.currentDate) == -1)
        {
            questData.date = this.currentDate;
            questData.locationType = this.currentArea;
            this.addItem(ExprolerWindow.icon.recovery, Terminology.get("exproler_playNewFile"), () =>
            {
                this.requestQuest(questData, locationData);
            });
        }

        var finisheds = globalSystem.questManager.getFinishedData(date, locationData.id);
        for (var finished of finisheds)
        {
            var text = "";
            if (finished.result || finished.result === undefined)
            {
                text = Terminology.get("exproler_playComplete").replace("{0}", finished.progress);
            }
            else
            {
                text = Terminology.get("exproler_playFailed");
            }
            var name = `_${finished.location}_${finished.date} ${text}`;
            this.addItem(ExprolerWindow.icon.log, name, null);
        }

        this.storyTarget.innerHTML = "";
        if (locationData != null)
        {
            var text = Terminology.get("exproler_locationdDscription");
            text = text.replace("{0}", locationData.name);
            this.storyTarget.innerHTML = text;
            this.currentStoryTargetDescription = Location.getDescription(locationData);
        }
    }

    requestQuest(questData, locationData)
    {
        var scenario = globalSystem.scenarioManager.getLastScenario(this.currentDate);
        if (scenario != null)
        {
            var next = globalSystem.uiManager.story.getNextScenario(scenario);
            var nextOccurable = globalSystem.uiManager.story.isScenarioOccurable(next);
            if (nextOccurable)
            {
                var buttonIndex = 0;
                globalSystem.uiManager.dialog.addButton(buttonIndex++, Terminology.get("yes"), () =>
                {
                    this.setupQuest(questData, locationData);
                    globalSystem.uiManager.dialog.close();
                });

                globalSystem.uiManager.dialog.addButton(buttonIndex++, Terminology.get("confirm_go_story"), () =>
                {
                    var flow = new StoryFlow();
                    flow.overwriteScenario = next;
                    globalSystem.flowManager.setFlow(flow, 0);
                    globalSystem.uiManager.dialog.close();
                });

                var text = Terminology.get("confirm_nextScenario");
                globalSystem.uiManager.dialog.open(text);
                return;
            }
        }

        var isInventoryFull = false;
        for (var survivor of globalSystem.survivorManager.survivors)
        {
            if (survivor.inventory.isFull)
            {
                isInventoryFull = true;
                break;
            }
        }
        var isHouseEnable = globalSystem.uiManager.menuTab.isHouseEnable;
        if (isInventoryFull && isHouseEnable)
        {
            var buttonIndex = 0;
            globalSystem.uiManager.dialog.addButton(buttonIndex++, Terminology.get("yes"), () =>
            {
                this.setupQuest(questData, locationData);
                globalSystem.uiManager.dialog.close();
            });

            globalSystem.uiManager.dialog.addButton(buttonIndex++, Terminology.get("confirm_go_house"), () =>
            {
                globalSystem.flowManager.setFlow(new HouseFlow(), 0);
                globalSystem.uiManager.dialog.close();
            });

            var text = Terminology.get("confirm_house");
            globalSystem.uiManager.dialog.open(text);
            return;
        }

        this.setupQuest(questData, locationData);
    }

    setupQuest(questData, locationData)
    {
        var scenario = globalSystem.scenarioManager.getNextScenario(questData.date);
        if (scenario != null)
        {
            if (scenario.timings.indexOf("questStart") == -1)
            {
                scenario = null;
            }
        }
        globalSystem.questManager.setupQuest(questData, scenario, questData.area, locationData.id);
        globalSystem.flowManager.setFlow(new QuestFlow());
        globalSystem.soundManager.pauseBgm();
    }

    back()
    {
        var exproler = globalSystem.uiManager.exproler;
        if (exproler.currentArea != null)
        {
            exproler.showArea(exproler.currentDate);
            return;
        }
        if (exproler.currentDate != -1)
        {
            exproler.showDate();
            return;
        }
    }

    openStoryTargetDescription()
    {
        if (StringExtension.isNullOrEmpty(this.currentStoryTargetDescription))
        {
            return;
        }
        globalSystem.uiManager.dialog.open(this.currentStoryTargetDescription);
    }
}

new ExprolerWindow();
