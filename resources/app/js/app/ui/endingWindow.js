class EndingWindow extends UIElement
{
    constructor()
    {
        super("ending");
        this.window = null;
        this.chapter = null;
        this.title = null;
        this.fadeInSpeed = 1;
        this.waitTimer = 0;
    }

    setup()
    {
        this.window = document.getElementById("endingWindow");
        this.chapter = document.getElementById("endingChapter");
        this.title = document.getElementById("endingTitle");
    }

    setupText(data)
    {
        this.window.style.opacity = 0;
        this.chapter.innerHTML = data.chapter;
        this.title.innerHTML = data.title;

        globalSystem.uiManager.background.setImage(data.image);

        this.waitTimer = 2;
    }

    updateFade()
    {
        if (this.waitTimer > 0)
        {
            this.waitTimer -= globalSystem.time.deltaTime;
            return false;
        }

        var opacity = parseFloat(this.window.style.opacity);
        if (opacity >= 1)
        {
            return true;
        }

        opacity += this.fadeInSpeed * globalSystem.time.deltaTime;
        this.window.style.opacity = opacity;

        return false;
    }
}

new EndingWindow();
