class QuestionWindow extends UIElement
{
    constructor()
    {
        super("question");
        this.openButton = null;
        this.closeButton = null;
        this.window = null;
        this.animator = new Animator();
        this.windowAnim = null;
        this.buttons = [];
    }

    static get elementCount()
    {
        return 12;
    }

    setup()
    {
        this.window = document.getElementById("question");
        this.openButton = document.getElementById("questionOpen");
        this.openButton.onclick = function (owner)
        {
            return function ()
            {
                owner.open();
            };
        }(this);
        this.closeButton = document.getElementById("questionClose");
        this.closeButton.onclick = function (owner)
        {
            return function ()
            {
                owner.close();
            };
        }(this);
    }

    update()
    {
        this.animator.update();
    }

    enable()
    {
        this.openButton.style.display = "inline";
    }

    disable()
    {
        this.openButton.style.display = "none";
    }

    open()
    {
        if (this.windowAnim != null)
        {
            return;
        }

        var onEnd = () =>
        {
            this.windowAnim = null;
        };
        this.setupButtons();
        this.updateQuestionButtons();
        this.window.style.display = "inline";
        this.windowAnim = this.animator.opacity(this.window, 0, 1, 0.5, "ease-out", onEnd);
    }

    close()
    {
        if (this.windowAnim != null)
        {
            return;
        }

        var onEnd = () =>
        {
            this.window.style.display = "none";
            this.windowAnim = null;
        };
        this.windowAnim = this.animator.opacity(this.window, 1, 0, 0.5, "ease-out", onEnd);
    }

    setupButtons()
    {
        for (var i = 0; i < QuestionWindow.elementCount; i++)
        {
            this.clearQuestionButton(i);
        }

        var index = 0;
        this.setupQuestionButton(index++, () => { return Terminology.get("question_help"); }, () => { globalSystem.uiManager.question.close(); globalSystem.uiManager.help.open(); });
        this.setupQuestionButton(index++, () => { return Terminology.get("question_itemCatalog"); }, () => { globalSystem.uiManager.question.close(); this.openItemCatalog(); });
        if (globalSystem.flowManager.currentFlow != null && globalSystem.flowManager.currentFlow instanceof QuestFlow)
        {
            this.setupQuestionButton(index++, () => { return Terminology.get("question_craft"); }, () => { globalSystem.uiManager.question.close(); this.openCraftList(); });
            this.setupQuestionButton(index++, () => { return Terminology.get("question_storyTarget"); }, () => { globalSystem.uiManager.question.close(); this.openStoryTargetDescription(); });
        }

        var isMainScenarioFinished = globalSystem.flagManager.getFlagValue("mainScenarioFinished00");
        if (isMainScenarioFinished)
        {
            this.setupQuestionButton(index++, () => { return Terminology.get("question_contents"); }, () => { globalSystem.uiManager.question.close(); this.openEndlessInfo(); });
        }
    }

    setupQuestionButton(index, getText, onClick)
    {
        var button = document.getElementById(`questionElement${index}`);
        if (button == null)
        {
            return;
        }

        if (getText != null)
        {
            button.style.display = "inline";
        }
        else
        {
            button.style.display = "none";
            return;
        }

        button.onclick = function ()
        {
            onClick();
            globalSystem.uiManager.question.updateQuestionButtons();
            SaveSystem.saveSystem();
        };

        var data = {
            element: button,
            getText: getText,
            onClick: onClick
        };
        this.buttons[index] = data;
    }

    clearQuestionButton(index)
    {
        var button = document.getElementById(`questionElement${index}`);
        if (button == null)
        {
            return;
        }
        button.style.display = "none";
    }

    updateQuestionButtons()
    {
        for (var button of this.buttons)
        {
            if (button == null)
            {
                continue;
            }

            this.updateQuestionButtonText(button);
        }
    }

    updateQuestionButtonText(data)
    {
        var text = data.getText();
        data.element.innerHTML = text;
    }

    openStoryTargetDescription()
    {
        var quest = globalSystem.questManager.currentQuest;
        if (quest == null)
        {
            globalSystem.uiManager.dialog.open(Terminology.get("story_targetDescription_notFound"));
            return;
        }

        var date = quest.date;
        var scenario = globalSystem.scenarioManager.getLastScenario(date);
        if (scenario == null)
        {
            globalSystem.uiManager.dialog.open(Terminology.get("story_targetDescription_notFound"));
            return;
        }

        var target = ScenarioExecutor.getScenarioTarget(scenario);
        if (target == null)
        {
            globalSystem.uiManager.dialog.open(Terminology.get("story_targetDescription_notFound"));
            return;
        }

        globalSystem.uiManager.dialog.open(target.description);
    }

    openCraftList()
    {
        var names = [];
        var descriptions = [];

        var length = globalSystem.itemCraftData.getLength(0);
        for (var i = 0; i < length; i++)
        {
            var recipe = globalSystem.itemCraftData.getDataByIndex(0, i);
            var isOpen = ItemCraft.isOpen(recipe.id);
            if (isOpen)
            {
                names.push(recipe.name);
                descriptions.push(globalSystem.uiManager.craft.getCraftDescription(recipe));
            }
            else
            {
                names.push(Terminology.get("calalog_unknown"));
                descriptions.push(Terminology.get("house_unknownDescription"));
            }
        }

        globalSystem.uiManager.catalog.open(Terminology.get("question_craft"), names, (index) =>
        {
            if (index >= descriptions.length)
            {
                return;
            }
            var description = descriptions[index];
            globalSystem.uiManager.dialog.open(description);
        });
    }

    openItemCatalog()
    {
        var items = globalSystem.itemData.getDatasByWhere((item) =>
        {
            var result = Type.toBoolean(item.catalog);
            return result;
        });
        var names = [];
        for (var item of items)
        {
            var isOpened = globalSystem.houseManager.isOpenedItem(item.id);
            if (isOpened)
            {
                names.push(item.name);
            }
            else
            {
                names.push(Terminology.get("calalog_unknown"));
            }
        }

        globalSystem.uiManager.catalog.open(Terminology.get("question_itemCatalog"), names, (index) =>
        {
            if (index >= items.length)
            {
                return;
            }

            var item = items[index];
            var isOpened = globalSystem.houseManager.isOpenedItem(item.id);
            if (isOpened)
            {
                var description = ItemExecutor.getDescription(item, true);
                globalSystem.uiManager.dialog.open(description);
            }
            else
            {
                globalSystem.uiManager.dialog.open(Terminology.get("calalog_notOpenedItem"));
            }
        });
    }

    openEndlessInfo()
    {
        var title = Terminology.get("question_contents");
        var info = globalSystem.endlessManager.getEndlessInfo();

        var message = `${title}${info}<br>`;
        globalSystem.uiManager.dialog.open(message);
    }
}

new QuestionWindow();
