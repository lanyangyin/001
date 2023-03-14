class AreaDataHolder extends DataHolder
{
    constructor()
    {
        super("areaData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/location/areaData.csv"]);
    }

    getAreaLocations(area, group = null, type = null)
    {
        var result = [];
        var areas = this.getDatasByKey("area", area);
        for (var area of areas)
        {
            if (StringExtension.isValid(group) && StringExtension.isValid(area.group) && group != area.group)
            {
                continue;
            }
            if (StringExtension.isValid(type) && StringExtension.isValid(area.type) && type != area.type)
            {
                continue;
            }
            result.push(area);
        }

        return result;
    }

    getAreaLocation(location)
    {
        var result = this.getDataByKey("location", location);
        return result;
    }
}

new AreaDataHolder();
