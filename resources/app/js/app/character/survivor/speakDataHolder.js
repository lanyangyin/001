class SpeakDataHolder extends DataHolder
{
    constructor()
    {
        super("speakData");
    }

    setup()
    {
        this.setupPath([
            "resources/data/default/character/speakData.csv",
            "resources/data/default/character/speakData_event.csv",
            "resources/data/default/character/speakData_chat.csv",
            "resources/data/default/character/speakData_location.csv"
        ]);
    }

    onLoad()
    {
        // テーブルを統合
        this.concatDatas("id");
    }

    getDatasByTypeArg(type, arg0)
    {
        var result = [];
        var correct = this.getDatasByKey("type", type);
        if (correct.length == 0)
        {
            return result;
        }

        for (var item of correct)
        {
            if (StringExtension.isNullOrEmpty(item.arg0) == false)
            {
                if (item.arg0 != arg0)
                {
                    continue;
                }
            }

            result.push(item);
        }
        return result;
    }
}

new SpeakDataHolder();
