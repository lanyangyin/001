class CheckNextDestinationEvent extends Event
{
    constructor()
    {
        super("checkNextDestination", 0, -1);

        this.locations = [];
        this.counts = [];
    }

    setupEvent(survivor, stage)
    {
        var baseCampCount = 2;
        var otherCount = 1;
        this.locations = this.getNextDestinations(baseCampCount, otherCount);
        this.counts = this.getNextDestinationsCount(baseCampCount + otherCount);
        this.speakCheckNextDestination(survivor);

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

        for (var i = 0; i < this.locations.length; i++)
        {
            var location = this.locations[i];
            var count = this.counts[i];
            if (location.name == input)
            {
                var text = globalSystem.uiManager.textInput[survivor.index].text;
                globalSystem.uiManager.textInput[survivor.index].reset();
                globalSystem.uiManager.textLine[survivor.index].writeInput(text);

                survivor.speak("ok", []);

                var currentCount = globalSystem.areaManager.getIndex() + 1;
                globalSystem.endlessManager.setDestination(location.id, count + currentCount);
                return true;
            }
        }

        return false;
    }

    exitEvent(survivor, stage)
    {
        globalSystem.survivorManager.unlock(survivor);
    }

    getNextDestinations(baseCampCount, otherCount)
    {
        var currentLocation = globalSystem.locationManager.location.id;

        var baseCamps = [];
        var correctBaseCamps = globalSystem.areaData.getAreaLocations(AreaManager.area.endless, null, "baseCamp");
        correctBaseCamps = Random.shuffle(correctBaseCamps);
        for (var i = 0; i < correctBaseCamps.length; i++)
        {
            if (correctBaseCamps[i].location == currentLocation)
            {
                continue;
            }
            var location = globalSystem.locationData.getDataById(correctBaseCamps[i].location);
            if (location == null)
            {
                continue;
            }
            baseCamps.push(location);
            if (baseCamps.length >= baseCampCount)
            {
                break;
            }
        }

        var others = [];
        var correctOthers = [];
        correctOthers = correctOthers.concat(globalSystem.areaData.getAreaLocations(AreaManager.area.endless, null, "challenge"));
        correctOthers = correctOthers.concat(globalSystem.areaData.getAreaLocations(AreaManager.area.endless, null, "bonus"));
        correctOthers = Random.shuffle(correctOthers);
        for (var i = 0; i < correctOthers.length; i++)
        {
            if (correctOthers[i].location == currentLocation)
            {
                continue;
            }
            var location = globalSystem.locationData.getDataById(correctOthers[i].location);
            if (location == null)
            {
                continue;
            }
            others.push(location);
            if (others.length >= otherCount)
            {
                break;
            }
        }

        var result = [];
        result = result.concat(baseCamps);
        result = result.concat(others);

        return result;
    }

    getNextDestinationsCount(count)
    {
        var result = [];
        for (var i = 0; i < count; i++)
        {
            var rand = 5 + Random.range(15);
            result.push(rand);
        }
        return result;
    }

    speakCheckNextDestination(survivor)
    {
        survivor.speak("searchNextDestination", []);

        for (var i = 0; i < this.locations.length; i++)
        {
            var name = `<button>${this.locations[i].name}</button>`;
            var count = this.counts[i];
            if (i == this.locations.length - 1)
            {
                survivor.speak("findNextDestinationLast", [count, name]);
            }
            else
            {
                survivor.speak("findNextDestination", [count, name]);
            }
        }

        survivor.speak("checkNextDestination", [name]);
    }
}
