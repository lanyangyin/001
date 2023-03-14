class TitleWindow extends UIElement
{
    constructor()
    {
        super("title");
        this.image = null;
        this.overlay = [];
        this.logo = null;
        this.startButton = null;
        this.clearButton = null;

        this.animator = new Animator();
    }

    setup()
    {
        this.image = document.getElementById("titleBg");
        for (var i = 0; i < 10; i++)
        {
            var overlay = document.getElementById(`titleBgOverlay${i}`);
            this.overlay.push(overlay);
        }
        this.logo = document.getElementById("titleLogo");
        this.startButton = document.getElementById("titleStart");
        this.startButton.onclick = function ()
        {
            globalSystem.flowManager.setFlow(new EnterFlow());
        };
        this.clearButton = document.getElementById("titleCredit");
        this.clearButton.onclick = function ()
        {
            globalSystem.uiManager.credit.open();
        };
    }

    update()
    {
        this.animator.update();
    }

    init()
    {
        var isMainScenarioFinished = globalSystem.flagManager.getFlagValue("mainScenarioFinished00");
        if (isMainScenarioFinished)
        {
            this.startButton.innerHTML = Terminology.get("titleContinue");
        }
        else
        {
            this.startButton.innerHTML = Terminology.get("titleStart");
        }

        for (var overlay of this.overlay)
        {
            overlay.style.display = "none";
        }
    }

    setImage(id)
    {
        var data = globalSystem.backgroundData.getDataById(id);
        if (data != null)
        {
            globalSystem.resource.loadBackgroundImage(this.image, data.path);
        }
    }

    setOverlayImage(index, id)
    {
        var data = globalSystem.titleData.getDataById(id);
        if (data != null)
        {
            var overlay = this.overlay[index];
            globalSystem.resource.loadBackgroundImage(overlay, data.image);
            overlay.style.display = "inline";
            overlay.style.zIndex = data.zIndex;
        }
    }

    removeLogo()
    {
        this.logo.style.opacity = 0;
    }

    fadeInLogo(id)
    {
        var data = globalSystem.backgroundData.getDataById(id);
        if (data != null)
        {
            globalSystem.resource.loadBackgroundImage(this.logo, data.path);
        }
        this.animator.opacity(this.logo, 0, 1, 2, "ease-out", null);
    }
}

new TitleWindow();
