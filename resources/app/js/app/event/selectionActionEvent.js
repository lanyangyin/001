class SelectionActionEvent extends SelectionEvent
{
    constructor(args)
    {
        super();

        this.speakId = args[0];
        this.words = [args[1], args[2]];
        this.events = [args[3], args[4]];
    }

    setupEvent(survivor, stage)
    {
        survivor.speak(this.speakId, []);

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
        var result = [];
        for (var id of this.events)
        {
            var event = EventGenerator.generateById(id);
            if (event == null)
            {
                continue;
            }
            result.push(event);
        }
        result = Random.shuffle(result);
        return result;
    }

    getSelectionWords(survivor, stage)
    {
        var result = [];
        for (var id of this.words)
        {
            var data = globalSystem.inputWordData.getDataById(id);
            if (data == null)
            {
                continue;
            }
            result.push(data.type);
        }
        return result;
    }

    getAskSpeakId(survivor, stage)
    {
        return "selectionAction";
    }

    getSelectionText(survivor, stage)
    {
        var result = "";
        for (var i = 0; i < this.words.length; i++)
        {
            var id = this.words[i];
            var data = globalSystem.inputWordData.getDataById(id);
            if (data == null)
            {
                continue;
            }
            result += "<button>" + data.word0 + "</button>";
            result += Terminology.get("selection_or");
        }
        return result;
    }

    getSelectedSpeakId(survivor, stage)
    {
        return "selected";
    }

    onEventSelected(survivor, stage, event)
    {
        super.onEventSelected(survivor, stage, event);
        survivor.speak("timeElapsed", []);
    }
}