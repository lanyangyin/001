class SoundSwitch extends UIElement
{
    constructor()
    {
        super("sound");
        this.button = null;
    }

    setup()
    {
        this.button = document.getElementById("soundSwitch");
        if (this.button != null)
        {
            this.button.addEventListener("click", function ()
            {
                globalSystem.soundManager.load();
                globalSystem.uiManager.sound.switchEneble();
            }, false);
        }

        if (Platform.isMobile == false)
        {
            globalSystem.soundManager.load();
            globalSystem.uiManager.sound.switchEneble();
        }
    }

    switchEneble()
    {
        var enabled = globalSystem.soundManager.enabled;
        if (enabled)
        {
            globalSystem.soundManager.disable();
            this.updateSwitchText();
        }
        else
        {
            globalSystem.soundManager.enable();
            this.updateSwitchText();
        }
    }

    updateSwitchText()
    {
        if (this.button == null)
        {
            return;
        }

        var enabled = globalSystem.soundManager.enabled;
        if (enabled)
        {
            this.button.innerText = Terminology.get("sound_off");
        }
        else
        {
            this.button.innerText = Terminology.get("sound_on");
        }
    }
}

new SoundSwitch();
