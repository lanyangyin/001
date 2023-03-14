class HelpWindow extends UIElement
{
    constructor()
    {
        super("help");
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
        this.window = document.getElementById("help");
        this.closeButton = document.getElementById("helpClose");
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
        this.updateHelpButtons();
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
        for (var i = 0; i < HelpWindow.elementCount; i++)
        {
            this.clearHelpButton(i);
        }

        var index = 0;
        this.setupHelpButton(index++, () => { return Terminology.get("help_search"); }, () => { globalSystem.uiManager.dialog.open(Terminology.get("helpDescription_search")); });
        this.setupHelpButton(index++, () => { return Terminology.get("help_inputWord"); }, () => { globalSystem.uiManager.dialog.open(Terminology.get("helpDescription_inputWord")); });
        this.setupHelpButton(index++, () => { return Terminology.get("help_redWord"); }, () => { globalSystem.uiManager.dialog.open(Terminology.get("helpDescription_redWord")); });
        this.setupHelpButton(index++, () => { return Terminology.get("help_vitalStamina"); }, () => { globalSystem.uiManager.dialog.open(Terminology.get("helpDescription_vitalStamina")); });
        this.setupHelpButton(index++, () => { return Terminology.get("help_inventory"); }, () => { globalSystem.uiManager.dialog.open(Terminology.get("helpDescription_inventory")); });
        this.setupHelpButton(index++, () => { return Terminology.get("help_skill"); }, () => { globalSystem.uiManager.dialog.open(Terminology.get("helpDescription_skill")); });

        index = 6;
        this.setupHelpButton(index++, () => { return Terminology.get("help_story"); }, () => { globalSystem.uiManager.dialog.open(Terminology.get("helpDescription_story")); });
        this.setupHelpButton(index++, () => { return Terminology.get("help_explorer"); }, () => { globalSystem.uiManager.dialog.open(Terminology.get("helpDescription_explorer")); });
        this.setupHelpButton(index++, () => { return Terminology.get("help_house"); }, () => { globalSystem.uiManager.dialog.open(Terminology.get("helpDescription_house")); });
        this.setupHelpButton(index++, () => { return Terminology.get("help_saveData"); }, () => { globalSystem.uiManager.dialog.open(Terminology.get("helpDescription_saveData")); });
        this.setupHelpButton(index++, () => { return Terminology.get("help_contact"); }, () => { globalSystem.uiManager.dialog.open(Terminology.get("helpDescription_contact")); });
    }

    setupHelpButton(index, getText, onClick)
    {
        var button = document.getElementById(`helpElement${index}`);
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
            globalSystem.uiManager.help.updateHelpButtons();
            SaveSystem.saveSystem();
        };

        var data = {
            element: button,
            getText: getText,
            onClick: onClick
        };
        this.buttons[index] = data;
    }

    clearHelpButton(index)
    {
        var button = document.getElementById(`helpElement${index}`);
        if (button == null)
        {
            return;
        }
        button.style.display = "none";
    }

    updateHelpButtons()
    {
        for (var button of this.buttons)
        {
            if (button == null)
            {
                continue;
            }

            this.updateHelpButtonText(button);
        }
    }

    updateHelpButtonText(data)
    {
        var text = data.getText();
        data.element.innerHTML = text;
    }
}

new HelpWindow();
