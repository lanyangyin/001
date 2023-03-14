class CheckNextLocationEvent extends Event
{
    constructor()
    {
        super("checkNextLocation", 0, -1);

        this.locations = [];
    }

    setupEvent(survivor, stage)
    {
        var count = 2 + Random.range(2);
        var quest = globalSystem.questManager.currentQuest;
        this.locations = this.getNextLocations(count, quest);
        this.speakCheckNextLocation(survivor);

        for (var location of this.locations)
        {
            globalSystem.areaManager.pushFoundLocationById(location.id);
        }

        globalSystem.survivorManager.lock(survivor);
    }

    executeEvent(survivor, stage)
    {
        globalSystem.uiManager.textLine[survivor.index].setState(TextLine.state.waiting);

        var input = globalSystem.uiManager.textInput[survivor.index].getConverted();
        if (StringExtension.isNullOrEmpty(input))
        {
            return false;
        }

        var quest = globalSystem.questManager.currentQuest;
        var scenario = globalSystem.questManager.currentScenario;
        for (var location of this.locations)
        {
            if (location.name == input)
            {
                var text = globalSystem.uiManager.textInput[survivor.index].text;
                globalSystem.uiManager.textInput[survivor.index].reset();
                globalSystem.uiManager.textLine[survivor.index].writeInput(text);

                survivor.speak("ok", []);
                globalSystem.areaManager.registerNextLocation(location.id);
                survivor.pushEvent(new NextLocationEvent(quest, scenario, true, true), Event.executeType.event);
                return true;
            }
        }

        if (input == "return")
        {
            var text = globalSystem.uiManager.textInput[survivor.index].text;
            globalSystem.uiManager.textInput[survivor.index].reset();
            globalSystem.uiManager.textLine[survivor.index].writeInput(text);

            survivor.speak("ok", []);
            if (quest != null)
            {
                var onEnd = null;
                if (scenario != null)
                {
                    onEnd = QuestExecutor.onEndScenario;
                }
                var event = EventGenerator.generate(quest.successEvent, quest.successEventArgs, onEnd);
                if (event != null)
                {
                    survivor.pushEvent(event, Event.executeType.event);
                }
            }
            else
            {
                survivor.pushEvent(new ReturnGatewayEvent(true, true), Event.executeType.event);
            }
            return true;
        }

        return false;
    }

    exitEvent(survivor, stage)
    {
        globalSystem.survivorManager.unlock(survivor);
    }

    getNextLocations(count, quest)
    {
        var currentLocation = globalSystem.locationManager.location.id;
        var useGroup = true;
        if (quest != null)
        {
            useGroup = Type.toBoolean(quest.useAreaGroup);
        }
        var result = globalSystem.areaManager.getNextLocations(count, currentLocation, useGroup);
        return result;
    }

    speakCheckNextLocation(survivor)
    {
        var arg = "";
        for (var i = 0; i < this.locations.length; i++)
        {
            arg += `<button>${this.locations[i].name}</button>`;
            if (i < this.locations.length - 1)
            {
                arg += Terminology.get("selection_and");
            }
        }

        var isNextMemoryItem = false;
        var quest = globalSystem.questManager.currentQuest;
        var lastScenario = globalSystem.scenarioManager.getLastScenario(quest.date);
        if (lastScenario != null)
        {
            isNextMemoryItem = (lastScenario.condition == "memoryItem");
        }

        var memoryItems = survivor.inventory.getTemporaryByType("memory");
        if (isNextMemoryItem && memoryItems.length > 0)
        {
            var name = memoryItems[0].name;
            survivor.speak("checkNextLocationFoundMemoryItem", [arg, name]);
        }
        else if (survivor.staminaRatio < 0.3)
        {
            survivor.speak("checkNextLocationHungry", [arg]);
        }
        else
        {
            survivor.speak("checkNextLocation", [arg]);
        }
    }
}
