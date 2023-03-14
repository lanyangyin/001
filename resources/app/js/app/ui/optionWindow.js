class OptionWindow extends UIElement
{
    constructor()
    {
        super("option");
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
        this.window = document.getElementById("option");
        this.openButton = document.getElementById("optionOpen");
        this.openButton.onclick = function (owner)
        {
            return function ()
            {
                owner.open();
            };
        }(this);
        this.closeButton = document.getElementById("optionClose");
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
        this.updateOptionButtons();
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
        for (var i = 0; i < OptionWindow.elementCount; i++)
        {
            this.clearOptionButton(i);
        }

        var index = 0;
        this.setupOptionButton(index++, () => { return `${Terminology.get("option_bgmVolume")} : ${globalSystem.soundManager.bgmVolumeIndex}`; }, () => { globalSystem.soundManager.switchBgmVolume(); });
        this.setupOptionButton(index++, () => { return `${Terminology.get("option_seVolume")} : ${globalSystem.soundManager.seVolumeIndex}`; }, () => { globalSystem.soundManager.switchSeVolume(); });
        this.setupOptionButton(index++, () => { if (globalSystem.uiManager.window.isFullscreen) { return Terminology.get("option_windowMode"); } else { return Terminology.get("option_fullscreenMode"); } }, () => { globalSystem.uiManager.window.switchFullscreen(); });
        this.setupOptionButton(index++, () => { return `${Terminology.get("option_windowSize")} : ${globalSystem.uiManager.window.getCurrentSizeType()}`; }, () => { globalSystem.uiManager.window.setFullscreen(false); globalSystem.uiManager.window.switchWindowSize(); });
        this.setupOptionButton(index++, () => { return `${Terminology.get("option_textWaitType")} : ${globalSystem.textLineManager.getCurrentTextWaitType()}`; }, () => { globalSystem.textLineManager.switchTextWaitTime(); });
        this.setupOptionButton(index++, () => { return `${Terminology.get("option_textAutoWaitType")} : ${globalSystem.textAutoManager.waitType.name}`; }, () => { globalSystem.textAutoManager.switchWaitType(); });

        index = 6;
        this.setupOptionButton(index++, () => { if (globalSystem.textAutoManager.stopOnScenario) { return Terminology.get("option_textAutoStop_on"); } else { return Terminology.get("option_textAutoStop_off"); } }, () => { globalSystem.textAutoManager.switchStopOnScenario(); });
        this.setupOptionButton(index++, () => { return Terminology.get(`option_fontSize_${GraphicsSetting.fontSizeIndex}`); }, () => { GraphicsSetting.switchFontSize(); });
        this.setupOptionButton(index++, () => { if (GraphicsSetting.isAnimationCut) { return Terminology.get("option_animationCut_on"); } else { return Terminology.get("option_animationCut_off"); } }, () => { globalSystem.uiManager.option.close(); this.animationCut(); });
        if (globalSystem.flowManager.currentFlow != null && globalSystem.flowManager.currentFlow instanceof TitleFlow)
        {
            this.setupOptionButton(index++, () => { return Terminology.get("option_modeSelect"); }, () => { globalSystem.uiManager.option.close(); GameModeSetting.openSelectDialog(); });
            this.setupOptionButton(index++, () => { return Terminology.get("option_clearSave"); }, () => { globalSystem.uiManager.option.close(); this.clearSave(); });
        }
        else
        {
            this.setupOptionButton(index++, () => { return Terminology.get("option_returnTitle"); }, () => { globalSystem.uiManager.option.close(); globalSystem.gameManager.resetToTitle(); globalSystem.flowManager.setFlow(new TitleFlow()); });
        }
        this.setupOptionButton(index++, () => { return Terminology.get("option_exit"); }, () => { globalSystem.uiManager.option.close(); globalSystem.gameManager.exit(); });
    }

    setupOptionButton(index, getText, onClick)
    {
        var button = document.getElementById(`optionElement${index}`);
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
            globalSystem.uiManager.option.updateOptionButtons();
            SaveSystem.saveSystem();
        };

        var data = {
            element: button,
            getText: getText,
            onClick: onClick
        };
        this.buttons[index] = data;
    }

    clearOptionButton(index)
    {
        var button = document.getElementById(`optionElement${index}`);
        if (button == null)
        {
            return;
        }
        button.style.display = "none";
    }

    updateOptionButtons()
    {
        for (var button of this.buttons)
        {
            if (button == null)
            {
                continue;
            }

            this.updateOptionButtonText(button);
        }
    }

    updateOptionButtonText(data)
    {
        var text = data.getText();
        data.element.innerHTML = text;
    }

    animationCut()
    {
        if (GraphicsSetting.isAnimationCut)
        {
            GraphicsSetting.switchAnimationCut();
        }
        else
        {
            globalSystem.uiManager.dialog.addButton(0, Terminology.get("yes"), () => { globalSystem.uiManager.dialog.close(); GraphicsSetting.switchAnimationCut(); });
            globalSystem.uiManager.dialog.addButton(1, Terminology.get("no"), () => { globalSystem.uiManager.dialog.close(); });
            globalSystem.uiManager.dialog.open(Terminology.get("confirm_animationCut"));
        }
    }

    clearSave()
    {
        globalSystem.uiManager.dialog.addButton(0, Terminology.get("yes"), () => { SaveSystem.clearApp(); document.location.reload(); });
        globalSystem.uiManager.dialog.addButton(1, Terminology.get("no"), () => { globalSystem.uiManager.dialog.close(); });
        globalSystem.uiManager.dialog.open(Terminology.get("confirm_clearSave"));
    }
}

new OptionWindow();
