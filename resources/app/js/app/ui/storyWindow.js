class StoryWindow extends UIElement
{
    constructor()
    {
        super("story");
        this.description = null;
        this.chapter = null;
        this.title = null;
        this.outline = null;
        this.target = null;
        this.targetText = null;
        this.backButton = null;
        this.nextButton = null;
        this.currentScenarioIndex = 0;
        this.reserveScenarioIndex = -1;
        this.currentScenario = null;
        this.nextScenario = null;
        this.targetButtonType = true;
        this.continueScenarioIndex = 0;
        this.temporaryCount = 0;
        this.timer = new Timer();
    }

    static get targetType()
    {
        var result =
        {
            invalid: 0,
            exproler: 1,
            description: 2,
            scenario: 3,
            continue: 4,
            replay: 5,
        };
        return result;
    }

    setup()
    {
        this.description = document.getElementById("storyDescription");
        this.chapter = document.getElementById("storyChapter");
        this.title = document.getElementById("storyTitle");
        this.outline = document.getElementById("storyOutlineText");
        this.target = document.getElementById("storyTargetText");
        this.backButton = document.getElementById("storyBack");
        this.nextButton = document.getElementById("storyNext");

        this.target.onclick = () =>
        {
            this.onClickTarget();
        };

        this.backButton.onclick = () =>
        {
            var list = globalSystem.scenarioManager.finishId;
            if (this.currentScenarioIndex - 1 >= list.length)
            {
                return;
            }
            var prevIndex = this.currentScenarioIndex;
            var valid = false;
            for (var i = 0; i < list.length; i++)
            {
                this.currentScenarioIndex--;
                if (this.currentScenarioIndex < 0)
                {
                    this.currentScenarioIndex = 0;
                    break;
                }
                var id = list[this.currentScenarioIndex];
                var scenario = globalSystem.scenarioData.getDataById(id);
                if (StringExtension.isValid(scenario.chapter))
                {
                    valid = true;
                    break;
                }
            }
            if (valid == false)
            {
                this.currentScenarioIndex = prevIndex;
            }
            this.setupLayout(this.currentScenarioIndex);
        };

        this.nextButton.onclick = () =>
        {
            var list = globalSystem.scenarioManager.finishId;
            var length = list.length;
            if (globalSystem.scenarioManager.temporaryScenarioId != null)
            {
                length += 1;
            }
            if (this.currentScenarioIndex + 1 >= length)
            {
                return;
            }
            var prevIndex = this.currentScenarioIndex;
            var valid = false;
            for (var i = 0; i < length; i++)
            {
                this.currentScenarioIndex++;
                if (this.currentScenarioIndex >= length - 1)
                {
                    this.currentScenarioIndex = length - 1;
                    valid = true;
                    break;
                }
                var id = list[this.currentScenarioIndex];
                var scenario = globalSystem.scenarioData.getDataById(id);
                if (StringExtension.isValid(scenario.chapter))
                {
                    valid = true;
                    break;
                }
            }
            if (valid == false)
            {
                this.currentScenarioIndex = prevIndex;
            }
            this.setupLayout(this.currentScenarioIndex);
        };
    }

    update()
    {
        this.timer.update(globalSystem.time.deltaTime);
    }

    setupLayout(index, useReserved = false)
    {
        this.currentScenario = null;
        this.nextScenario = null;

        var finishedScenarioLength = globalSystem.scenarioManager.finishId.length;
        if (useReserved && this.reserveScenarioIndex != -1)
        {
            if (this.reserveScenarioIndex < finishedScenarioLength)
            {
                index = this.reserveScenarioIndex;
            }
            else
            {
                index = finishedScenarioLength - 1;
            }
            this.reserveScenarioIndex = -1;
        }

        var id = null;
        if (index < finishedScenarioLength)
        {
            id = globalSystem.scenarioManager.finishId[index];
        }

        if (id == null)
        {
            id = globalSystem.scenarioManager.temporaryScenarioId;
        }

        var data = globalSystem.scenarioData.getDataById(id);
        if (data == null)
        {
            return;
        }

        this.setupScenarioDescription(data);
        this.setupScenarioTarget(data);

        this.currentScenario = data;
        this.currentScenarioIndex = index;
        this.temporaryCount = 0;
    }

    setupScenarioDescription(scenario)
    {
        this.chapter.innerText = `${scenario.chapter}`;
        this.title.innerText = scenario.storyTitle;

        if (StringExtension.isValid(scenario.storyOutline))
        {
            var outline = ScenarioExecutor.getScenarioOutline(scenario);
            this.outline.innerHTML = outline;
        }
        else
        {
            this.outline.innerHTML = "";
        }
    }

    setupScenarioTarget(scenario)
    {
        this.target.innerHTML = "";
        this.target.style.color = Color.marineBlue;

        this.continueScenarioIndex = this.getHasNextScenarioIndex();
        var target = ScenarioExecutor.getScenarioTarget(scenario);
        if (target.hasNext)
        {
            var next = this.getNextScenario(scenario);
            var nextOccurable = this.isScenarioOccurable(next);
            if (nextOccurable)
            {
                this.target.innerHTML = `${Terminology.get("story_scenario_advance")}　<br>${target.condition}`;
                this.target.style.color = Color.red;
                this.targetButtonType = StoryWindow.targetType.scenario;
                this.nextScenario = next;
            }
            else
            {
                if (StringExtension.isValid(target.target))
                {
                    this.target.innerHTML = target.target;
                    this.target.style.color = Color.marineBlue;
                    if (target.target == Terminology.get("story_target_invalid"))
                    {
                        this.targetButtonType = StoryWindow.targetType.invalid;
                    }
                    else if (target.condition == Terminology.get("story_target_reboot"))
                    {
                        this.targetButtonType = StoryWindow.targetType.description;
                    }
                    else
                    {
                        this.targetButtonType = StoryWindow.targetType.exproler;
                    }
                    var list = globalSystem.scenarioManager.getNexts(scenario.date, true);
                    if (list.length > 0)
                    {
                        this.nextScenario = list[0];
                    }
                    else
                    {
                        list = globalSystem.scenarioManager.getNexts(scenario.openDate, true);
                        if (list.length > 0)
                        {
                            this.nextScenario = list[0];
                        }
                    }
                }
            }
        }
        else
        {
            var isMainScenarioFinished = globalSystem.flagManager.getFlagValue("mainScenarioFinished00");
            var isClosed = globalSystem.scenarioManager.isClosed(scenario.date);
            if (isMainScenarioFinished && isClosed)
            {
                this.target.innerHTML = Terminology.get("story_target_replay");
                this.target.style.color = Color.marineBlue;
                this.targetButtonType = StoryWindow.targetType.replay;
            }
            else
            {
                if (Type.toBoolean(scenario.hasNext) == false && this.continueScenarioIndex != -1)
                {
                    this.target.innerHTML = Terminology.get("story_target_continue");
                    this.target.style.color = Color.marineBlue;
                    this.targetButtonType = StoryWindow.targetType.continue;
                }
            }
        }
    }

    getNextScenario(scenario)
    {
        var next = globalSystem.scenarioManager.getNextScenario(scenario.date, true);
        if (next == null && StringExtension.isValid(scenario.openDate))
        {
            next = globalSystem.scenarioManager.getNextScenario(scenario.openDate, true);
        }
        return next;
    }

    isScenarioOccurable(scenario)
    {
        var result = (scenario != null && scenario.timings.indexOf("story") != -1 && scenario.occurRatio == 1);
        return result;
    }

    getHasNextScenarioIndex()
    {
        var finished = globalSystem.scenarioManager.finishId;
        for (var i = finished.length - 1; i >= 0; i--)
        {
            var id = finished[i];
            var scenario = globalSystem.scenarioData.getDataById(id);
            if (scenario == null)
            {
                continue;
            }
            if (StringExtension.isNullOrEmpty(scenario.storyTitle))
            {
                continue;
            }
            var target = ScenarioExecutor.getScenarioTarget(scenario);
            if (StringExtension.isValid(target.target))
            {
                if (target.target != Terminology.get("story_target_invalid"))
                {
                    return i;
                }
            }
        }

        return -1;
    }

    getLastScenarioIndexHasDescription()
    {
        var list = globalSystem.scenarioManager.finishId;
        for (var i = list.length - 1; i >= 0; i--)
        {
            var id = list[i];
            var scenario = globalSystem.scenarioData.getDataById(id);
            if (StringExtension.isNullOrEmpty(scenario.chapter))
            {
                continue;
            }
            return i;
        }

        return -1;
    }

    onClickTarget()
    {
        switch (this.targetButtonType)
        {
            case StoryWindow.targetType.invalid:
                {
                    if (this.continueScenarioIndex != -1)
                    {
                        globalSystem.uiManager.dialog.addButton(0, Terminology.get("dialog_close"), () =>
                        {
                            globalSystem.uiManager.dialog.close();
                            this.setupLayout(this.continueScenarioIndex);
                        });
                        globalSystem.uiManager.dialog.open(Terminology.get("story_other_invalid"));
                    }
                }
                break;
            case StoryWindow.targetType.exproler:
                {
                    var target = ScenarioExecutor.getScenarioTarget(this.currentScenario);
                    var description = target.description;

                    var buttonIndex = 0;
                    globalSystem.uiManager.dialog.addButton(buttonIndex++, Terminology.get("confirm_go_exproler"), () =>
                    {
                        globalSystem.uiManager.menuTab.exprolerButton.onclick();
                        globalSystem.uiManager.dialog.close();
                    });

                    var hasMemoryItem = null;
                    var memoryItems = globalSystem.houseManager.getItemsByKey("type", "memory");
                    for (var item of memoryItems)
                    {
                        if (StringExtension.isNullOrEmpty(item.arg0))
                        {
                            hasMemoryItem = item;
                            break;
                        }
                    }

                    if (this.nextScenario != null && Type.toBoolean(this.nextScenario.conditionSkippable))
                    {
                        if (hasMemoryItem != null)
                        {
                            globalSystem.uiManager.dialog.addButton(buttonIndex++, Terminology.get("story_skip_condition"), () =>
                            {
                                globalSystem.uiManager.dialog.close();
                                globalSystem.uiManager.dialog.addButton(0, Terminology.get("yes"), () =>
                                {
                                    globalSystem.houseManager.removeItem(hasMemoryItem);
                                    ScenarioExecutor.execute(this.nextScenario, this.currentScenario, "story");
                                    globalSystem.uiManager.dialog.close();
                                });
                                globalSystem.uiManager.dialog.addButton(1, Terminology.get("no"), () =>
                                {
                                    globalSystem.uiManager.dialog.close();
                                });
                                var message = Terminology.get("story_skip_condition_confirm");
                                message = message.replace("{0}", hasMemoryItem.name);
                                globalSystem.uiManager.dialog.open(message);
                            });
                        }
                        else
                        {
                            var craftable = null;
                            var memoryItemsAny = globalSystem.itemData.getDatasByWhere((item) =>
                            {
                                if (item.type != "memory")
                                {
                                    return false;
                                }
                                if (StringExtension.isValid(item.arg0))
                                {
                                    return false;
                                }
                                return true;
                            });
                            for (var item of memoryItemsAny)
                            {
                                if (ItemCraft.canCraft(item.id))
                                {
                                    craftable = item;
                                    break;
                                }
                            }
                            if (craftable != null)
                            {
                                globalSystem.uiManager.dialog.addButton(buttonIndex++, Terminology.get("story_skip_condition"), () =>
                                {
                                    globalSystem.uiManager.dialog.close();
                                    globalSystem.uiManager.dialog.addButton(0, Terminology.get("yes"), () =>
                                    {
                                        var craftedInfo = ItemCraft.craft(craftable.id);
                                        if (craftedInfo != null)
                                        {
                                            craftedInfo.owner.removeItem(craftedInfo.item);
                                            ScenarioExecutor.execute(this.nextScenario, this.currentScenario, "story");
                                        }
                                        globalSystem.uiManager.dialog.close();
                                    });
                                    globalSystem.uiManager.dialog.addButton(1, Terminology.get("no"), () =>
                                    {
                                        globalSystem.uiManager.dialog.close();
                                    });
                                    var message = Terminology.get("story_skip_condition_craft");
                                    message = message.replace("{0}", craftable.name);
                                    globalSystem.uiManager.dialog.open(message);
                                });
                            }
                        }
                    }

                    globalSystem.uiManager.dialog.addButton(buttonIndex++, Terminology.get("dialog_close"), () =>
                    {
                        globalSystem.uiManager.dialog.close();
                    });
                    globalSystem.uiManager.dialog.open(description);
                }
                break;
            case StoryWindow.targetType.description:
                {
                    var target = ScenarioExecutor.getScenarioTarget(this.currentScenario);
                    var description = target.description;
                    globalSystem.uiManager.dialog.addButton(0, Terminology.get("dialog_close"), () =>
                    {
                        globalSystem.uiManager.dialog.close();
                    });
                    globalSystem.uiManager.dialog.open(description);
                }
                break;
            case StoryWindow.targetType.scenario:
                {
                    var buttonIndex = 0;
                    globalSystem.uiManager.dialog.addButton(buttonIndex++, Terminology.get("yes"), () =>
                    {
                        ScenarioExecutor.execute(this.nextScenario, this.currentScenario, "story");
                        globalSystem.uiManager.dialog.close();
                    });
                    globalSystem.uiManager.dialog.addButton(buttonIndex++, Terminology.get("no"), () =>
                    {
                        globalSystem.uiManager.dialog.close();
                    });
                    var text = "";
                    if (GameModeSetting.isSkipScenarioCondition)
                    {
                        text = Terminology.get("story_confirm_advance_storyMode");
                    }
                    else
                    {
                        switch (this.currentScenario.condition)
                        {
                            case "memoryItem":
                                {
                                    text = Terminology.get("story_confirm_advance_memoryItem");
                                    var name = "";
                                    var date = this.currentScenario.date;
                                    var count = Number(this.currentScenario.conditionArgs[0]);
                                    var items = ScenarioExecutor.getNextMemoryItems(date, count);
                                    if (items.length > 0)
                                    {
                                        name = ItemExecutor.getName(items[0].item);
                                    }
                                    text = text.replace("{0}", name);
                                }
                                break;
                            case "deleteWorld":
                                {
                                    text = Terminology.get("story_confirm_deleteWorld");
                                    globalSystem.uiManager.dialog.close();
                                    var buttonIndex = 0;
                                    globalSystem.uiManager.dialog.addButton(buttonIndex++, Terminology.get("delete"), () =>
                                    {
                                        globalSystem.uiManager.dialog.close();
                                        var buttonIndex = 0;
                                        globalSystem.uiManager.dialog.addButton(buttonIndex++, Terminology.get("delete"), () =>
                                        {
                                            this.timer.clear();
                                            globalSystem.uiManager.dialog.close();
                                            var scenarioId = this.currentScenario.conditionArgs[1];
                                            var scenario = globalSystem.scenarioData.getDataById(scenarioId);
                                            if (scenario != null)
                                            {
                                                ScenarioExecutor.execute(scenario, this.currentScenario, "story");
                                            }
                                        });
                                        globalSystem.uiManager.dialog.addButton(buttonIndex++, Terminology.get("dialog_stop"), () =>
                                        {
                                            this.timer.clear();
                                            globalSystem.uiManager.dialog.close();
                                            if (this.currentScenario.conditionArgs[0] == "no")
                                            {
                                                ScenarioExecutor.execute(this.nextScenario, this.currentScenario, "story");
                                            }
                                        });
                                        globalSystem.uiManager.dialog.open(Terminology.get("story_confirm_deleteWorld_caution"));

                                        if (this.currentScenario.conditionArgs[0] == "yes")
                                        {
                                            this.timer.add(0.8, () => 
                                            {
                                                this.temporaryCount++;
                                                globalSystem.soundManager.playSe("button00");
                                                globalSystem.uiManager.dialog.close();
                                                if (this.temporaryCount >= 3)
                                                {
                                                    globalSystem.uiManager.dialog.close();
                                                    ScenarioExecutor.execute(this.nextScenario, this.currentScenario, "story");
                                                }
                                            });
                                        }
                                    });
                                    globalSystem.uiManager.dialog.addButton(buttonIndex++, Terminology.get("dialog_stop"), () =>
                                    {
                                        this.timer.clear();
                                        globalSystem.uiManager.dialog.close();
                                        if (this.currentScenario.conditionArgs[0] == "no")
                                        {
                                            ScenarioExecutor.execute(this.nextScenario, this.currentScenario, "story");
                                        }
                                    });
                                }
                                break;
                            default:
                                {
                                    text = Terminology.get("story_confirm_advance_other");
                                }
                                break;
                        }
                    }
                    globalSystem.uiManager.dialog.open(text);
                }
                break;
            case StoryWindow.targetType.continue:
                {
                    if (this.continueScenarioIndex != -1)
                    {
                        globalSystem.uiManager.dialog.addButton(0, Terminology.get("dialog_close"), () =>
                        {
                            globalSystem.uiManager.dialog.close();
                            this.setupLayout(this.continueScenarioIndex);
                        });
                        globalSystem.uiManager.dialog.open(Terminology.get("story_other_continue"));
                    }
                }
                break;
            case StoryWindow.targetType.replay:
                {
                    if (this.currentScenario != null)
                    {
                        globalSystem.uiManager.dialog.addButton(0, Terminology.get("yes"), () =>
                        {
                            globalSystem.uiManager.dialog.close();
                            var scenarios = globalSystem.scenarioData.getUpstreams(this.currentScenario);
                            if (scenarios.length > 0)
                            {
                                for (var i = 1; i < scenarios.length; i++)
                                {
                                    globalSystem.scenarioManager.enqueue(scenarios[i]);
                                }
                                ScenarioExecutor.execute(scenarios[0], null, "replay", null, true);
                                this.reserveScenarioIndex = this.currentScenarioIndex;
                            }
                        });
                        globalSystem.uiManager.dialog.addCloseButton(1);
                        globalSystem.uiManager.dialog.open(Terminology.get("story_confirm_replay"));
                    }
                }
                break;
        }
    }
}

new StoryWindow();
