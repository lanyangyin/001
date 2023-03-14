class ConfirmEvent extends Event
{
    constructor(count)
    {
        super("confirm", 0, count);
    }

    setupEvent(survivor, stage)
    {
        this.spoke = false;
        survivor.speak(this.getConfirmSpeakId(survivor, stage), this.getConfirmSpeakArg(survivor, stage));
        globalSystem.survivorManager.lock(survivor);
    }

    executeEvent(survivor, stage)
    {
        globalSystem.uiManager.textLine[survivor.index].setState(TextLine.state.waiting);

        var input = globalSystem.uiManager.textInput[survivor.index].getConverted();
        var text = globalSystem.uiManager.textInput[survivor.index].text;
        if (StringExtension.isNullOrEmpty(input))
        {
            return false;
        }

        if (this.checkInputYes(input))
        {
            globalSystem.uiManager.textInput[survivor.index].reset();
            globalSystem.uiManager.textLine[survivor.index].writeInput(text);
            survivor.speak("confirmSuccess", []);
            this.onYes(survivor, stage);
            return true;
        }
        else if (this, this.checkInputNo(input))
        {
            globalSystem.uiManager.textInput[survivor.index].reset();
            globalSystem.uiManager.textLine[survivor.index].writeInput(text);
            survivor.speak("confirmSuccess", []);
            this.onNo(survivor, stage);
            return true;
        }
        else if (this.isSkippable(survivor, stage))
        {
            // スキップ可能なら、このeventを終了して
            // CallEventにまわす
            return true;
        }
        else
        {
            globalSystem.uiManager.textInput[survivor.index].reset();
            globalSystem.uiManager.textLine[survivor.index].writeInput(text);
            var speakId = this.getConfirmFailedSpeakId(survivor, stage);
            survivor.speak(speakId, []);
            return false;
        }
    }

    exitEvent(survivor, stage)
    {
        globalSystem.uiManager.textLine[survivor.index].setState(TextLine.state.busy);
        globalSystem.survivorManager.unlock(survivor);
    }

    checkInputYes(input)
    {
        var words = this.getYesInputs();
        for (var word of words)
        {
            if (word == input)
            {
                return true;
            }
        }
        return false;
    }

    checkInputNo(input)
    {
        var words = this.getNoInputs();
        for (var word of words)
        {
            if (word == input)
            {
                return true;
            }
        }
        return false;
    }

    getYesInputs()
    {
        return ["yes"];
    }

    getNoInputs()
    {
        return ["no"];
    }

    onYes(survivor, stage)
    {
    }

    onNo(survivor, stage)
    {
    }

    getConfirmSpeakId(survivor, stage)
    {
        return StringExtension.empty;
    }

    getConfirmSpeakArg(survivor, stage)
    {
        return [];
    }

    getConfirmFailedSpeakId(survivor, stage)
    {
        return "confirmFailed";
    }

    isSkippable(survivor, stage)
    {
        return false;
    }

    getUseStamina()
    {
        return 0;
    }
}
