class SelectionSearchEvent extends SelectionEvent
{
    constructor()
    {
        super();
    }

    setupEvent(survivor, stage)
    {
        super.setupEvent(survivor, stage);

        globalSystem.cameraManager.focusSurvivor(survivor);
    }

    exitEvent(survivor, stage)
    {
        super.exitEvent(survivor, stage);

        globalSystem.cameraManager.focusReset();
    }

    getSelectionEvents(survivor, stage)
    {
        var result = stage.getEventsByType(CallObjectEvent);
        return result;
    }

    getSelectionWords(survivor, stage)
    {
        var result = [];
        for (var event of this.selectionEvents)
        {
            result.push(event.object.keyword);
        }
        return result;
    }

    getSelectionText(survivor, stage)
    {
        var result = "";
        for (var i = 0; i < this.selectionWords.length; i++)
        {
            result += "<button>" + this.selectionWords[i] + "</button>";
            if (i < this.selectionWords.length - 1)
            {
                result += Terminology.get("selection_and");
            }
        }
        return result;
    }

    getAskSpeakId(survivor, stage)
    {
        return "selectionSearch";
    }

    getSelectedSpeakId(survivor, stage)
    {
        return "selected";
    }

    isSkippable(survivor, stage)
    {
        return true;
    }

    getProbability(survivor, stage)
    {
        var staminaRatio = survivor.staminaRatio;
        if (staminaRatio < 0.5)
        {
            return staminaRatio;
        }

        return 1.0;
    }

    onEventSelected(survivor, stage, event)
    {
        super.onEventSelected(survivor, stage, event);
        for (var event of this.selectionEvents)
        {
            event.overwriteProbability = 0.1;
        }
    }
}
