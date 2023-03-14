class Flow
{
    constructor(elementId)
    {
        this.elementId = elementId;
    }

    get fadeIn()
    {
        return true;
    }

    get fadeOut()
    {
        return true;
    }

    get fadeTime()
    {
        return 0.5;
    }

    get isSaveOnExit()
    {
        return true;
    }

    setup()
    {
        this.enableUi(this.elementId);
        this.setupFlow();

        var hasTutorial = globalSystem.tutorialManager.check(this.elementId);
        if (hasTutorial)
        {
            return;
        }
        var hasPresent = globalSystem.presentManager.check(this.elementId);
        if (hasPresent)
        {
            return;
        }
    }

    update()
    {
        this.updateFlow();
    }

    exit()
    {
        if (this.isSaveOnExit)
        {
            SaveSystem.save();
        }

        globalSystem.uiManager.dialog.close();
        globalSystem.uiManager.context.close();

        this.disableUi(this.elementId);
        this.exitFlow();
    }

    setupFlow()
    {
    }

    updateFlow()
    {
    }

    exitFlow()
    {
    }

    enableUi(id)
    {
        if (id)
        {
            var ui = document.getElementById(id);
            if (ui != null)
            {
                ui.style.display = "inline";
            }
        }
    }

    disableUi(id)
    {
        if (id)
        {
            var ui = document.getElementById(id);
            if (ui != null)
            {
                ui.style.display = "none";
            }
        }
    }
}