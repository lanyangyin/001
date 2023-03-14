class TextAutoManager extends GlobalManager
{
    constructor()
    {
        super("textAutoManager");
        this.isAuto = false;
        this.buttons = [];
        this.timer = 0;
        this.waitType = null;
        this.stopOnScenario = true;
    }

    static get waitTimeType()
    {
        var result =
            [
                { index: 0, name: Terminology.get("textAuto_0"), time: 1.5, waitWrite: true },
                { index: 1, name: Terminology.get("textAuto_1"), time: 0.5, waitWrite: true },
                { index: 2, name: Terminology.get("textAuto_2"), time: 3.0, waitWrite: true },
                { index: 3, name: Terminology.get("textAuto_3"), time: 0.0, waitWrite: false },
            ];
        return result;
    }

    static get waitTimeTypeCount()
    {
        var result = TextAutoManager.waitTimeType.length;
        return result;
    }

    setup()
    {
        this.waitType = TextAutoManager.waitTimeType[0];
    }

    update()
    {
        this.updateAuto();
    }

    setAuto(auto)
    {
        this.isAuto = auto;
        this.updateButtons();

        SaveSystem.saveSystem();
    }

    setStopOnScenario(stop)
    {
        this.stopOnScenario = stop;
    }

    switchAuto()
    {
        this.setAuto(!this.isAuto);
    }

    switchStopOnScenario()
    {
        this.setStopOnScenario(!this.stopOnScenario);
    }

    setWaitType(index)
    {
        if (index >= TextAutoManager.waitTimeTypeCount)
        {
            return;
        }

        this.waitType = TextAutoManager.waitTimeType[index];
    }

    switchWaitType()
    {
        var index = this.waitType.index + 1;
        if (index >= TextAutoManager.waitTimeTypeCount)
        {
            index = 0;
        }
        this.setWaitType(index);
    }

    registerButton(button)
    {
        if (button == null)
        {
            return;
        }

        this.buttons.push(button);
        this.updateButtons();

        button.onclick = (event) =>
        {
            this.switchAuto();
            event.stopPropagation();
        };
    }

    onExecuteScenario(scenario)
    {
        if (this.stopOnScenario == false)
        {
            return;
        }

        if (scenario == null)
        {
            return;
        }

        var stop = false;
        switch (scenario.scenarioType)
        {
            case "main":
            case "sub":
            case "character":
                {
                    stop = true;
                }
            default:
                break;
        }
        if (stop == false)
        {
            return;
        }

        if (this.isAuto)
        {
            this.setAuto(false);
        }
    }

    updateButtons()
    {
        for (var button of this.buttons)
        {
            if (this.isAuto)
            {
                button.style.color = Color.marineBlue;
            }
            else
            {
                button.style.color = Color.gray;
            }
        }
    }

    updateAuto()
    {
        if (this.isAuto == false)
        {
            this.timer = 0;
            return;
        }

        if (globalSystem.textInputManager.hasFocus())
        {
            this.timer = 0;
            return;
        }

        if (globalSystem.textInputManager.isEmpty() == false)
        {
            this.timer = 0;
            return;
        }

        if (this.waitType.waitWrite)
        {
            for (var textLine of globalSystem.uiManager.textLine)
            {
                if (textLine.isTextWriting)
                {
                    return;
                }
            }
        }

        this.timer += globalSystem.time.deltaTime;
        if (this.timer > this.waitType.time)
        {
            globalSystem.textLineManager.onClick();
            this.timer = 0;
        }
    }

}

new TextAutoManager();
