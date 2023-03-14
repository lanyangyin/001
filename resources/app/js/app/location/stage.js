class Stage
{
    constructor(id, depth, data, location)
    {
        this.id = id;
        this.depth = depth;
        this.data = data;
        this.eventRarity = location.data.eventRarity;
        this.enemyLevel = location.data.enemyLevel;
        //this.name = LocationGenerator.getPrefix(id) + data.name;
        this.data = data;
        this.name = data.name;
        this.type = data.type;
        //this.bridge = LocationGenerator.getPrefix(id) + data.bridge;
        this.bridge = data.bridge;
        this.describe = data.describe;
        this.nextIndex = [];
        this.events = [];
        this.options = [];
        this.visitCount = 0;
        this.exitBroken = false;
        this.overwriteSearchResults = [];
        this.onVisitEvent = (stage) => { location.onVisitStage(stage); };

        this.setupOptions(data.options);
        this.setupOverwriteSearchResults(data.overwriteSearchResults);
    }

    get eventCount()
    {
        var result = this.events.length;
        return result;
    }

    update(survivor)
    {
        for (var option of this.options)
        {
            option.execute(survivor, this);
        }
    }

    setupOptions(ids)
    {
        for (var id of ids)
        {
            if (StringExtension.isNullOrEmpty(id))
            {
                continue;
            }

            var option = Class.getInstance(id);
            if (option == null)
            {
                continue;
            }

            this.pushOption(option);
        }
    }

    setupOverwriteSearchResults(ids)
    {
        for (var id of ids)
        {
            if (StringExtension.isNullOrEmpty(id))
            {
                continue;
            }

            this.overwriteSearchResults.push(id);
        }
    }

    onVisit()
    {
        this.visitCount++;

        if (this.onVisitEvent != null)
        {
            this.onVisitEvent(this);
        }
    }

    onLeave()
    {
        for (var event of this.events)
        {
            SurvivorCallHandler.registerLost(event);
        }
    }

    getEvent(survivor)
    {
        if (this.events.length == 0)
        {
            return null;
        }

        for (var event of this.events)
        {
            var probability = event.getProbability(survivor, this);
            if (probability > 1)
            {
                return event;
            }
        }

        var index = Random.range(this.events.length);
        var event = this.events[index];
        var probability = event.getProbability(survivor, this);
        if (probability <= 0)
        {
            return null;
        }

        var rand = (Random.range(100) / 100.0);
        if (probability > rand)
        {
            return this.events[index];
        }
        else
        {
            return null;
        }
    }

    getEventsByType(type)
    {
        var result = [];
        for (var event of this.events)
        {
            if (event instanceof type)
            {
                result.push(event);
            }
        }
        return result;
    }

    pushEvent(event)
    {
        this.events.push(event);
    }

    insertEvent(event)
    {
        this.events.unshift(event);
    }

    removeEvent(event)
    {
        this.events = List.remove(this.events, event);

        if (this.events.length == 0)
        {
            console.warn("Stage::removeEvent : 保持イベント数が0になりました");
        }
    }

    hasEvent(event)
    {
        for (var e of this.events)
        {
            if (e == event)
            {
                return true;
            }
        }
        return false;
    }

    pushOption(option)
    {
        this.options.push(option);
        option.setup(this);
    }

    pushOverwriteSearchResult(id)
    {
        this.overwriteSearchResults.push(id);
    }

    hasOverwriteSearchResult(id)
    {
        var result = (this.overwriteSearchResults.indexOf(id) != -1);
        return result;
    }

    popOverwriteSearchResult()
    {
        if (this.overwriteSearchResults.length == 0)
        {
            return null;
        }

        var result = this.overwriteSearchResults.shift();
        return result;
    }

    clearOverwriteSearchResults()
    {
        this.overwriteSearchResults = [];
    }
}
