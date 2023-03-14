class MenuTab extends UIElement
{
    constructor()
    {
        super("menuTab");
        this.ui = null;
        this.storyButton = null;
        this.exprolerButton = null;
        this.houseButton = null;
    }

    get isHouseEnable()
    {
        var result = (this.houseButton.style.display != "none");
        return result;
    }

    setup()
    {
        this.ui = document.getElementById("menuTab");
        this.exprolerButton = document.getElementById("menuExproler");
        this.exprolerButton.onclick = function ()
        {
            return function ()
            {
                if ((globalSystem.flowManager.currentFlow instanceof ExprolerFlow) == false)
                {
                    globalSystem.flowManager.setFlow(new ExprolerFlow(), 0);
                }
            };
        }();
        this.houseButton = document.getElementById("menuHouse");
        this.houseButton.onclick = function ()
        {
            return function ()
            {
                if ((globalSystem.flowManager.currentFlow instanceof HouseFlow) == false)
                {
                    globalSystem.flowManager.setFlow(new HouseFlow(), 0);
                }
            };
        }();
        this.storyButton = document.getElementById("menuStory");
        this.storyButton.onclick = function ()
        {
            return function ()
            {
                if ((globalSystem.flowManager.currentFlow instanceof StoryFlow) == false)
                {
                    globalSystem.flowManager.setFlow(new StoryFlow(), 0);
                }
            };
        }();
    }

    init()
    {
        /* nop */
    }

    setupButtons()
    {
        var storyEnable = true;
        var exprolerEnable = true;
        var houseEnable = true;
        var scenario = globalSystem.scenarioManager.getLastScenario();
        if (scenario != null)
        {
            exprolerEnable = Type.toBoolean(scenario.exproler);
            houseEnable = Type.toBoolean(scenario.house);
        }

        var flow = globalSystem.flowManager.currentFlow;
        this.setupButton(this.storyButton, flow instanceof StoryFlow, storyEnable);
        this.setupButton(this.exprolerButton, flow instanceof ExprolerFlow, exprolerEnable);
        this.setupButton(this.houseButton, flow instanceof HouseFlow, houseEnable);
    }

    setupButton(button, isCurrent, enable)
    {
        if (enable)
        {
            button.style.display = "inline";
            if (isCurrent)
            {
                button.style.opacity = 1.0;
                button.className = button.className.replace(/ borderless/g, "");
            }
            else
            {
                button.style.opacity = 0.3;
                button.className += " borderless";
            }
        }
        else
        {
            button.style.display = "none";
        }
    }

    enable()
    {
        this.setupButtons();
        this.ui.style.display = "inline";
    }

    disable()
    {
        this.ui.style.display = "none";
    }
}

new MenuTab();
