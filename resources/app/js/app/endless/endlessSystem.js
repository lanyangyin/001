class EndlessSystem
{
    static isEndless(quest)
    {
        if (quest == null)
        {
            return false;
        }

        var result = (quest.date == 9999);
        return result;
    }
}
