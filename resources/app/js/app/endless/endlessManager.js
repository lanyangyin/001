class EndlessManager extends GlobalManager
{
    constructor()
    {
        super("endlessManager");

        this.baseCampCount = 0;
        this.nextDestination = null;
        this.nextDestinationCount = 0;
    }

    incrementBaseCampCount()
    {
        this.baseCampCount++;
    }

    setDestination(id, count)
    {
        this.nextDestination = id;
        this.nextDestinationCount = count;
    }

    resetDestination()
    {
        this.nextDestination = null;
        this.nextDestinationCount = 0;
    }

    applyAreaLocation(location)
    {
        if (StringExtension.isValid(this.nextDestination))
        {
            var locationId = this.nextDestination;
            var index = this.nextDestinationCount;
            globalSystem.areaManager.pushOverwriteLocation(index, locationId);
        }

        return location;
    }

    onArrivedLocation(survivor, location)
    {
        if (this.nextDestination != null)
        {
            var index = globalSystem.areaManager.currentIndex;
            var location = globalSystem.areaManager.getCurrentLocation();
            if (this.nextDestination == location && Number(this.nextDestinationCount) == index)
            {
                var locationData = globalSystem.locationData.getDataById(location);
                if (locationData != null)
                {
                    survivor.speak("arrivedNextDestination", [locationData.name]);
                }
                this.resetDestination();
            }
        }
    }

    onArrivedLocationBefore(survivor, location)
    {
        /* nop */
    }

    onQuestEnd(complete)
    {
        if (complete)
        {
            var advance = globalSystem.areaManager.getIndex() + 1;
            this.nextDestinationCount = Number(this.nextDestinationCount) - advance;

            if (this.nextDestinationCount < 1)
            {
                this.nextDestinationCount = 1;
            }
        }
    }

    getEndlessInfo()
    {
        var endlressCharacterEpisode = Terminology.get("exproler_endlressCharacterEpisode");
        var dates = globalSystem.scenarioData.getDatesByType(ScenarioManager.scenarioType.character);
        var closedDates = 0;
        for (var date of dates)
        {
            if (globalSystem.scenarioManager.isClosed(date))
            {
                closedDates++;
            }
        }
        endlressCharacterEpisode = endlressCharacterEpisode.replace("{0}", closedDates);
        endlressCharacterEpisode = endlressCharacterEpisode.replace("{1}", dates.length);

        var endlressCollection = Terminology.get("exproler_endlressCollection");
        var collections = globalSystem.itemData.getDatasByKey("category", "collection");
        var openedCollections = 0;
        for (var collection of collections)
        {
            if (globalSystem.houseManager.isOpenedItem(collection.id))
            {
                openedCollections++;
            }
        }
        endlressCollection = endlressCollection.replace("{0}", openedCollections);
        endlressCollection = endlressCollection.replace("{1}", collections.length);

        var endlressItem = Terminology.get("exproler_endlressItem");

        var items = globalSystem.itemData.getDatasByWhere((item) =>
        {
            var result = Type.toBoolean(item.catalog);
            return result;
        });
        var openedItem = 0;
        for (var item of items)
        {
            if (globalSystem.houseManager.isOpenedItem(item.id))
            {
                openedItem++;
            }
        }
        endlressItem = endlressItem.replace("{0}", openedItem);
        endlressItem = endlressItem.replace("{1}", items.length);

        var result = `<br><br>${endlressCharacterEpisode}<br>${endlressCollection}<br>${endlressItem}`;
        return result;
    }
}

new EndlessManager();
