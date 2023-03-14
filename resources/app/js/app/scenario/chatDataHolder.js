class ChatDataHolder extends DataHolder
{
    constructor()
    {
        super("chatData");
    }

    setup()
    {
        this.setupPath([
            "resources/data/default/scenario/chatData.csv",
        ]);
    }

    getDatasByCharacters(characters)
    {
        var result = this.getDatasByWhere((data) =>
        {
            for (var target of data.characters)
            {
                var exist = false;
                for (var character of characters)
                {
                    if (character.id == target)
                    {
                        exist = true;
                        break;
                    }
                }

                if (exist == false)
                {
                    return false;
                }
            }

            return true;
        });

        return result;
    }
}

new ChatDataHolder();
