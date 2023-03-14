class NoteEventDataHolder extends DataHolder
{
    constructor()
    {
        super("noteData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/event/noteEventData.csv"]);
    }

    getRandom(location)
    {
        var list = this.getDatasByWhere((data) => { return StringExtension.isNullOrEmpty(data.location) || data.location == location; });
        if (list.length == 0)
        {
            return null;
        }

        list = Random.shuffle(list);
        for (var data of list)
        {
            var rand = Random.range(10) / 10.0;
            if (rand < Number(data.ratio))
            {
                return data;
            }
        }
        return list[0];
    }
}

new NoteEventDataHolder();