class QuestDataHolder extends DataHolder
{
    constructor()
    {
        super("questData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/quest/questData.csv"]);
    }

    getDataByRandom(date, location)
    {
        var result = this.getDatasByWhere((quest) => { return (quest.date == date && quest.locationType == location); });
        if (result.length == 0)
        {
            return null;
        }

        result = Random.shuffle(result);
        return result[0];
    }

    getDataByDate(date)
    {
        var result = this.getDataByKey("date", date);
        return result;
    }
}

new QuestDataHolder();
