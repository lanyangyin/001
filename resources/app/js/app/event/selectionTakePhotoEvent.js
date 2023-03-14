class SelectionTakePhotoEvent extends SelectionEvent
{
    constructor()
    {
        super();

        this.film = null;
        this.cancelObject = new Object();
    }

    setupEvent(survivor, stage)
    {
        globalSystem.cameraManager.focusSurvivor(survivor);

        this.film = survivor.getItemById("film00");
        if (this.film == null)
        {
            survivor.speak("takePhotoNoFilm", []);
            return;
        }

        super.setupEvent(survivor, stage);
    }

    executeEvent(survivor, stage)
    {
        if (this.film == null)
        {
            return true;
        }

        var result = super.executeEvent(survivor, stage);
        return result;
    }

    exitEvent(survivor, stage)
    {
        super.exitEvent(survivor, stage);

        globalSystem.cameraManager.focusReset();
    }

    getSelectionEvents(survivor, stage)
    {
        var result = [];
        var list = globalSystem.itemData.getDatasByKey("type", "photo");
        list = Random.shuffle(list);
        for (var i = 0; i < 3; i++)
        {
            result.push(list[i]);
        }
        result.push(this.cancelObject);
        return result;
    }

    getSelectionWords(survivor, stage)
    {
        var result = [];
        for (var event of this.selectionEvents)
        {
            if (event == this.cancelObject)
            {
                result.push("no");
                continue;
            }
            var location = globalSystem.locationData.getDataById(event.arg0);
            if (location == null)
            {
                continue;
            }
            result.push(location.name);
        }
        return result;
    }

    getSelectionText(survivor, stage)
    {
        var result = "";
        var length = this.selectionWords.length - 1;
        for (var i = 0; i < length; i++)
        {
            result += "<button>" + this.selectionWords[i] + "</button>";
            if (i < length - 1)
            {
                result += Terminology.get("selection_and");
            }
        }
        return result;
    }

    getAskSpeakId(survivor, stage)
    {
        return "selectionTakePhoto";
    }

    getSelectedSpeakId(survivor, stage)
    {
        return null;
    }

    onEventSelected(survivor, stage, item)
    {
        if (item == this.cancelObject)
        {
            survivor.speak("takePhotoCancel", []);
        }
        else
        {
            survivor.speak("takePhoto", []);
            survivor.removeItem(this.film);
            survivor.pushItem(item);
            survivor.inventory.pushTemporary(item);

            globalSystem.soundManager.playSe("camera00");
        }
    }

    isSkippable(survivor, stage)
    {
        return false;
    }
}
