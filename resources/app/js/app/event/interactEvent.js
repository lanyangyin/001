class InteractEvent extends Event
{
    constructor(args)
    {
        super("interact", 0, 1);
        this.data = null;
    }

    setupEvent(survivor, stage)
    {
        var location = stage.type;
        var rarity = parseInt(stage.eventRarity);

        var list = globalSystem.interactData.getDatasByWhere((item) =>
        {
            return ((StringExtension.isNullOrEmpty(item.location) || item.location == location) && (item.rarity <= rarity));
        });

        if (list.length == 0)
        {
            return;
        }

        var index = Random.range(list.length);
        this.data = list[index];

        if (this.data == null)
        {
            return;
        }

        survivor.speak("interactTry", [this.data.name]);
        globalSystem.survivorManager.lock(survivor);
        globalSystem.cameraManager.focusSurvivor(survivor);
    }

    executeEvent(survivor, stage)
    {
        if (this.data == null)
        {
            return true;
        }

        var result = this.updateInput(survivor, stage);
        return result;
    }

    exitEvent(survivor, stage)
    {
        globalSystem.survivorManager.unlock(survivor);
        globalSystem.cameraManager.focusReset();
    }

    updateInput(survivor, stage)
    {
        globalSystem.uiManager.textLine[survivor.index].setState(TextLine.state.waiting);

        var input = globalSystem.uiManager.textInput[survivor.index].getConverted();
        var text = globalSystem.uiManager.textInput[survivor.index].text;
        if (StringExtension.isNullOrEmpty(input))
        {
            return false;
        }

        globalSystem.uiManager.textInput[survivor.index].reset();
        globalSystem.uiManager.textLine[survivor.index].writeInput(text);

        if (input == "yes")
        {
            survivor.speak("interactRetry", []);
            return false;
        }

        if (input == "no")
        {
            survivor.speak("interactCancel", []);
            return true;
        }

        var inputWords = this.data.inputs;
        var resultEvents = this.data.events;
        var foundEvents = [];
        for (var i = 0; i < inputWords.length; i++)
        {
            if (inputWords[i] == input)
            {
                foundEvents.push(resultEvents[i]);
            }
            else if (globalSystem.inputWordData.contains(text, inputWords[i]))
            {
                foundEvents.push(resultEvents[i]);
            }
        }

        if (foundEvents.length == 0)
        {
            survivor.speak("interactFailed", []);
            return true;
        }

        var index = Random.range(foundEvents.length);
        var resultEvent = foundEvents[index];

        var event = EventGenerator.generateById(resultEvent);
        if (event == null)
        {
            survivor.speak("interactFailed", []);
            return true;
        }

        survivor.speak("ok", []);
        survivor.insertEvent(event, Event.executeType.event);

        return true;
    }
}