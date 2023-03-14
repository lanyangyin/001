class PresentDataHolder extends DataHolder
{
    constructor()
    {
        super("presentData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/present/presentData.csv"]);
    }

    getDatasByTiming(timing)
    {
        var result = this.getDatasByWhere((data) =>
        {
            if (data.timing != timing)
            {
                return false;
            }
            if (StringExtension.isValid(data.requireFlag))
            {
                var valid = globalSystem.flagManager.getFlagValue(data.requireFlag);
                if (valid == false)
                {
                    return false;
                }
            }

            var currentDate = new Date();
            var year = currentDate.getFullYear();
            if (StringExtension.isValid(data.startDate))
            {
                var date = data.startDate.split("/");
                var condition = new Date(year, Number(date[0]) - 1, Number(date[1]));
                if (currentDate < condition)
                {
                    return false;
                }
            }
            if (StringExtension.isValid(data.endDate))
            {
                var date = data.endDate.split("/");
                var condition = new Date(year, Number(date[0]) - 1, Number(date[1]));
                condition.setDate(condition.getDate() + 1);
                if (currentDate > condition)
                {
                    return false;
                }
            }
            return true;
        });

        return result;
    }
}

new PresentDataHolder();