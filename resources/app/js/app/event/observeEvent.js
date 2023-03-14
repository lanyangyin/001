class ObserveEvent extends AccessObjectEvent
{
    constructor(callObjectEvent)
    {
        super("observe", 3, 1, callObjectEvent);
        this.events = this.object.events;
        this.isSafe = false;
        this.yesWords = ["yes", "search", "look"];
        this.noWords = ["no"];
    }

    setupEvent(survivor, stage)
    {
        this.isSafe = true;
        for (var id of this.events)
        {
            var event = EventGenerator.generateById(id);
            if (event == null)
            {
                continue;
            }
            if (event.hasTag("danger"))
            {
                this.isSafe = false;
                break;
            }
        }

        if (StringExtension.isValid(this.image))
        {
            globalSystem.uiManager.background.setImage(this.image, 1, 0.5);
        }

        if (this.isSafe)
        {
            survivor.speak("observeSafe", [this.object.keyword]);
        }
        else
        {
            survivor.speak("observeDanger", [this.object.keyword]);
        }

        globalSystem.cameraManager.focusBg();
        globalSystem.survivorManager.lock(survivor);
    }

    executeEvent(survivor, stage)
    {
        if (this.isSafe)
        {
            survivor.insertEvent(new CallObjectEvent(this.object, "search00"), Event.executeType.event);
            return true;
        }
        else
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

            for (var yes of this.yesWords)
            {
                if (input == yes)
                {
                    survivor.speak("ok", []);
                    survivor.insertEvent(new CallObjectEvent(this.object, "search00"), Event.executeType.event);
                    return true;
                }
            }

            for (var no of this.noWords)
            {
                if (input == no)
                {
                    survivor.speak("ok", []);
                    return true;
                }
            }

            survivor.speak("observeFailed", []);
            return false;
        }
    }

    exitEvent(survivor, stage)
    {
        globalSystem.uiManager.background.fadeOut(0.5, 1);
        globalSystem.survivorManager.unlock(survivor);
    }

    getUseStamina()
    {
        return 0;
    }
}
