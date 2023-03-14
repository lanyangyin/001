class SelectionMoveEvent extends SelectionEvent
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
        var result = stage.getEventsByType(MoveEvent);
        return result;
    }

    getSelectionWords(survivor, stage)
    {
        var result = [];
        for (var event of this.selectionEvents)
        {
            var next = globalSystem.locationManager.getStage(event.nextStageIndex);
            result.push(next.bridge);
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

    getSelectedSpeakId(survivor, stage)
    {
        return "selected";
    }

    isSkippable(survivor, stage)
    {
        return true;
    }
}