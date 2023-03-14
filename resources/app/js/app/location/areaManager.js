class AreaManager extends GlobalManager
{
    constructor()
    {
        super("areaManager");
        this.area = null;
        this.currentAreaLocation = null;
        this.currentIndex = 0;
        this.finished = false;
        this.visitedLocations = [];

        this.usedDescribe = [];
        this.overwriteLocations = [];

        this.openedLocations = [];
        this.currentGroups = [];

        this.overwriteCurrentLocation = null;
    }

    static get area()
    {
        var result =
        {
            endless: "endless",
        };
        return result;
    }

    get isLastLocation()
    {
        if (this.currentAreaLocation == null)
        {
            return false;
        }

        var result = Type.toBoolean(this.currentAreaLocation.last);
        return result;
    }

    requestArea(area, location = null)
    {
        var prevArea = this.area;

        this.area = area;

        if (this.area != prevArea)
        {
            this.finished = false;
            this.visitedLocations = [];
            this.usedDescribe = [];
            this.overwriteLocations = [];

            if (location != null)
            {
                this.registerNextLocation(location);
            }
            else
            {
                this.currentAreaLocation = this.getTopAreaLocation();
            }
            this.currentIndex = 0;
        }
    }

    registerNextLocation(id)
    {
        var areaLocations = this.getAreaLocations(true);
        if (areaLocations.length == 0)
        {
            return;
        }

        for (var data of areaLocations)
        {
            if (data.location != id)
            {
                continue;
            }
            this.currentAreaLocation = data;
            this.pushVisitedLocation(data);
            break;
        }

        this.currentIndex++;
    }

    getAreaLocations(withOverwrite = false)
    {
        if (this.area == null)
        {
            return null;
        }

        var result = globalSystem.areaData.getAreaLocations(this.area);

        if (withOverwrite)
        {
            for (var overwrite of this.overwriteLocations)
            {
                var data = globalSystem.areaData.getAreaLocation(overwrite.location);
                if (data == null)
                {
                    continue;
                }
                result.push(data);
            }
        }

        return result;
    }

    getLocations()
    {
        if (this.area == null)
        {
            return null;
        }

        var areaLocations = this.getAreaLocations();
        if (areaLocations.length == 0)
        {
            return null;
        }

        var result = [];
        for (var data of areaLocations)
        {
            result.push(data.location);
        }

        return result;
    }

    getNextLocations(count, currentLocation, useGroup = true)
    {
        var nextIndex = this.getIndex() + 1;
        var areaLocations = this.getAreaLocations();
        var group = this.getGroup(this.area);

        var nextlocations = [];
        var randomLocation = [];
        for (var location of areaLocations)
        {
            if (useGroup && StringExtension.isValid(group) && StringExtension.isValid(location.group) && group != location.group)
            {
                continue;
            }

            if (Type.toBoolean(location.start))
            {
                nextlocations.push(location);
            }
            else
            {
                randomLocation.push(location);
            }
        }

        var currentIndex = Random.range(nextlocations.length);
        for (var i = 0; i < nextlocations.length; i++)
        {
            if (nextlocations[i].location == currentLocation)
            {
                currentIndex = i;
                break;
            }
        }

        var result = [];
        for (var i = 0; i < count; i++)
        {
            var index = currentIndex + (i + 1) * parseInt(areaLocations[currentIndex].nextAdvance);
            for (var j = 0; j < 10; j++)
            {
                if (index >= nextlocations.length)
                {
                    index -= nextlocations.length;
                }
                else
                {
                    break;
                }
            }

            var location = nextlocations[index];
            var locationData = globalSystem.locationData.getDataById(location.location);
            if (locationData == null)
            {
                continue;
            }
            result.push(locationData);
        }

        if (GlobalParam.get("randomAreaLocationRatio"))
        {
            randomLocation = Random.shuffle(randomLocation);
            for (var location of randomLocation)
            {
                if (currentLocation == location.location)
                {
                    continue;
                }
                var ratios = location.ratios;
                var ratio = 0;
                if (nextIndex < ratios.length)
                {
                    ratio = parseFloat(ratios[nextIndex]);
                }
                else
                {
                    ratio = parseFloat(ratios[ratios.length - 1]);
                }
                var random = Random.range(100) / 100.0;
                if (random > ratio)
                {
                    continue;
                }
                var locationData = globalSystem.locationData.getDataById(location.location);
                if (locationData == null)
                {
                    continue;
                }
                var index = Random.range(result.length);
                result[index] = locationData;
                break;
            }
        }

        var overwriteIndex = 0;
        for (var overwrite of this.overwriteLocations)
        {
            if (overwriteIndex >= count)
            {
                break;
            }
            if (overwrite.index == nextIndex)
            {
                var locationData = globalSystem.locationData.getDataById(overwrite.location);
                if (locationData == null)
                {
                    continue;
                }
                result[overwriteIndex] = locationData;
                overwriteIndex++;
            }
        }

        return result;
    }

    getCurrentLocation()
    {
        if (this.overwriteCurrentLocation != null)
        {
            var overwrite = this.overwriteCurrentLocation;
            this.overwriteCurrentLocation = null;
            return overwrite;
        }

        if (this.currentAreaLocation == null)
        {
            return null;
        }

        var result = this.currentAreaLocation.location;
        return result;
    }

    getTopAreaLocation()
    {
        if (this.area == null)
        {
            return null;
        }

        var areaLocations = this.getAreaLocations();
        if (areaLocations.length == 0)
        {
            return null;
        }

        var result = areaLocations[0];
        return result;
    }

    getIndex()
    {
        return this.currentIndex;
    }

    finishArea()
    {
        this.finished = true;
    }

    isCompleteArea()
    {
        return this.finished;
    }

    pushVisitedLocation(location, visited = true)
    {
        var data = { area: location.area, location: location.location, visited: visited };
        this.visitedLocations.push(data);
    }

    pushFoundLocationById(id)
    {
        var areaLocations = this.getAreaLocations(true);
        if (areaLocations.length == 0)
        {
            return;
        }

        for (var data of areaLocations)
        {
            if (data.location != id)
            {
                continue;
            }
            this.pushVisitedLocation(data, false);
            break;
        }
    }

    getVisitedLocationsId()
    {
        var result = [];
        for (var data of this.visitedLocations)
        {
            if (data.visited == false)
            {
                continue;
            }
            if (result.indexOf(data.location) != -1)
            {
                continue;
            }
            result.push(data.location);
        }
        return result;
    }

    setGroup(area, group)
    {
        for (var data of this.currentGroups)
        {
            if (data.area == area)
            {
                data.group = group;
                return;
            }
        }

        var newData = { area: area, group: group };
        this.currentGroups.push(newData);
    }

    getGroup(area)
    {
        for (var data of this.currentGroups)
        {
            if (data.area == area)
            {
                var result = data.group;
                return result;
            }
        }

        return null;
    }

    applyOpenedLocations()
    {
        for (var data of this.visitedLocations)
        {
            var already = null;
            for (var opened of this.openedLocations)
            {
                if (opened.area == data.area && opened.location == data.location)
                {
                    already = opened;
                    break;
                }
            }

            // 探索した順番になるようにする
            if (already != null)
            {
                this.openedLocations = List.remove(this.openedLocations, already);
            }
            this.openedLocations.push(data);
        }
    }

    isOpenedLocation(area, location)
    {
        for (var opened of this.openedLocations)
        {
            if (opened.area == area && opened.location == location)
            {
                return true;
            }
        }
        return false;
    }

    getOpenedLocations(area)
    {
        var result = [];
        for (var opened of this.openedLocations)
        {
            if (opened.area == area)
            {
                result.push(opened.location);
            }
        }
        return result;
    }

    clearOpendLocations(area)
    {
        var result = [];
        for (var opened of this.openedLocations)
        {
            if (opened.area != area)
            {
                result.push(opened);
            }
        }
        this.openedLocations = result;
    }

    pushOverwriteLocation(index, location)
    {
        // すでに登録されているなら無視
        for (var already of this.overwriteLocations)
        {
            if (already.index == index && already.location == location)
            {
                return;
            }
        }

        var data = { index: index, location: location };
        this.overwriteLocations.push(data);
    }
}

new AreaManager();
