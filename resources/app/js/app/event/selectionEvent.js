class SelectionEvent extends Event
{
    constructor()
    {
        super("selection", 0, 1);
        this.selectEvent = null;
        this.selectWord = null;
        this.selectionEvents = [];
        this.selectionWords = [];
        this.selectionText = null;

        this.spoke = false;
        this.survivorIndex = 0;
    }

    setupEvent(survivor, stage)
    {
        this.spoke = false;
        this.survivorIndex = survivor.index;
        this.selectEvent = null;
        this.selectWord = null;
        this.selectionEvents = this.getSelectionEvents(survivor, stage);
        this.selectionWords = this.getSelectionWords(survivor, stage);
        this.selectionText = this.getSelectionText(survivor, stage);
        globalSystem.survivorManager.lock(survivor);
    }

    executeEvent(survivor, stage)
    {
        // 選択肢が2つより少ないなら、無条件で終了
        var length = this.selectionWords.length;
        var min = this.getMinCount();
        if (length < min)
        {
            this.onFailed(survivor, stage);
            return true;
        }

        // 選択肢の中に同じワードがあれば、無条件で終了
        for (var i = 0; i < length; i++)
        {
            for (var j = 0; j < length; j++)
            {
                if (i == j)
                {
                    continue;
                }
                if (this.selectionWords[i] === this.selectionWords[j])
                {
                    this.selectEvent = null;
                    return true;
                }
            }
        }

        if (this.spoke == false)
        {
            survivor.speak(this.getAskSpeakId(), [this.selectionText]);
            this.spoke = true;
            return false;
        }
        else
        {
            globalSystem.uiManager.textLine[survivor.index].setState(TextLine.state.waiting);

            var input = globalSystem.uiManager.textInput[survivor.index].getConverted();
            if (StringExtension.isNullOrEmpty(input))
            {
                return false;
            }

            for (var i = 0; i < this.selectionWords.length; i++)
            {
                if (input === this.selectionWords[i])
                {
                    this.selectEvent = this.selectionEvents[i];
                    this.selectWord = this.selectionWords[i];

                    var text = globalSystem.uiManager.textInput[survivor.index].text;
                    globalSystem.uiManager.textInput[survivor.index].reset();
                    globalSystem.uiManager.textLine[survivor.index].writeInput(text);
                    return true;
                }
            }

            if (this.isSkippable(survivor, stage))
            {
                // スキップ可能なら、このeventを終了して
                // CallEventにまわす
                this.selectEvent = null;
                return true;
            }

            return false;
        }
    }

    exitEvent(survivor, stage)
    {
        if (this.selectEvent != null)
        {
            var speakId = this.getSelectedSpeakId(survivor, stage);
            if (StringExtension.isValid(speakId))
            {
                survivor.speak(speakId, [this.selectWord]);
            }
            this.onEventSelected(survivor, stage, this.selectEvent);
        }

        globalSystem.uiManager.textLine[survivor.index].setState(TextLine.state.busy);
        globalSystem.survivorManager.unlock(survivor);
    }

    getSelectionEvents(survivor, stage)
    {
    }

    getSelectionWords(survivor, stage)
    {
    }

    getSelectionText(survivor, stage)
    {
    }

    getAskSpeakId(survivor, stage)
    {
        return "selection";
    }

    getSelectedSpeakId(survivor, stage)
    {
    }

    getMinCount(survivor, stage)
    {
        return 2;
    }

    onFailed(survivor, stage)
    {
    }

    onEventSelected(survivor, stage, event)
    {
        survivor.insertEvent(event, Event.executeType.event);
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
