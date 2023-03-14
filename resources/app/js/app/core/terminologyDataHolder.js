class TerminologyDataHolder extends DataHolder
{
    constructor()
    {
        super("terminologyData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/system/terminologyData.csv"]);
    }

    onLoad()
    {
        var keys = Object.keys(this.dicts[0]);
        for (var id of keys)
        {
            var element = document.getElementById(id);
            if (element == null)
            {
                continue;
            }
            var list = this.dicts[0][id];
            if (list.length == 0)
            {
                continue;
            }
            element.innerHTML = list[0].text;
        }
    }
}

new TerminologyDataHolder();


class Terminology
{
    static get(id)
    {
        var data = globalSystem.terminologyData.getDataById(id);
        if (data == null)
        {
            return "";
        }
        return data.text;
    }
}

