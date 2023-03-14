class TextLineManager extends GlobalManager
{
    constructor()
    {
        super("textLineManager");
        this.window = null;
        this.waitingTextLine = null;
    }

    get textWaitTimeIndex()
    {
        if (globalSystem.uiManager.textLine.length == 0)
        {
            return null;
        }
        var textLine = globalSystem.uiManager.textLine[0];
        var result = textLine.textWaitTimeIndex;
        return result;
    }

    setup()
    {
        document.body.addEventListener('keydown', (event) => { this.onKeyDonw(event); });
        document.body.addEventListener('wheel', (event) => { this.onWheel(event); });
    }

    update()
    {
        for (var textLine of globalSystem.uiManager.textLine)
        {
            if (textLine.isBusy == false)
            {
                continue;
            }

            this.waitingTextLine = textLine;
            this.waitingTextLine.setState(TextLine.state.enter);
            break;
        }
    }

    setupElement(id)
    {
        this.window = document.getElementById(id);
        this.window.onclick = () => { this.onClick(); };
    }

    setTextWaitTime(index)
    {
        for (var textLine of globalSystem.uiManager.textLine)
        {
            textLine.setTextWaitTime(index);
        }
    }

    switchTextWaitTime()
    {
        for (var textLine of globalSystem.uiManager.textLine)
        {
            textLine.switchTextWaitTime();
        }
    }

    getCurrentTextWaitType()
    {
        if (globalSystem.uiManager.textLine.length == 0)
        {
            return null;
        }
        var textLine = globalSystem.uiManager.textLine[0];
        var result = textLine.getCurrentTextWaitType();
        return result;
    }

    onKeyDonw(event)
    {
        if (event.key != 'Enter' && event.key != ' ')
        {
            return;
        }
        this.onClick();
    }

    onWheel(event)
    {
        /*
        for (var textLine of globalSystem.uiManager.textLine)
        {
            if (textLine.isDisplay && textLine.isScrollBottom == false)
            {
                return;
            }
        }
        */

        if (event.deltaY > 0)
        {
            this.onClick();
            event.stopPropagation();
        }
    }

    onClick()
    {
        if (this.waitingTextLine == null)
        {
            return;
        }

        this.waitingTextLine.notifyNext();
        this.waitingTextLine.setState(TextLine.state.busy);
        this.waitingTextLine = null;
    }
}

new TextLineManager();