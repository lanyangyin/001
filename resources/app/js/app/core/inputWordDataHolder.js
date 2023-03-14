class InputWordDataHolder extends DataHolder
{
    constructor()
    {
        super("inputWordData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/system/inputWordData.csv"]);
    }

    convert(word, contains = false)
    {
        var data = this.getDataByWhere((data) =>
        {
            if (contains)
            {
                return (word.indexOf(data.word0) != -1 || word.indexOf(data.word1) != -1);
            }
            else
            {
                return (data.word0 == word || data.word1 == word);
            }
        });

        if (data == null)
        {
            return word;
        }
        return data.type;
    }

    contains(text, type)
    {
        var list = this.getDatasByWhere((data) => { return (data.type == type); });
        if (list.length == 0)
        {
            return false;
        }

        for (var data of list)
        {
            if (text.indexOf(data.word0) != -1)
            {
                return true;
            }
            if (text.indexOf(data.word1) != -1)
            {
                return true;
            }
        }
        return false;
    }
}

new InputWordDataHolder();