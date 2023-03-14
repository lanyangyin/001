class ItemCraftDataHolder extends DataHolder
{
    constructor()
    {
        super("itemCraftData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/item/itemCraftData.csv"]);
    }

    isOpen()
    {
        return true;
    }

    getDatasByMaterial(material)
    {
        var result = this.getDatasByWhere((data) =>
        {
            for (var i = 0; i < 3; i++)
            {
                var field = `material${i}`;
                if (data[field] == material.id)
                {
                    return true;
                }
            }
            return false;
        });

        return result;
    }
}

new ItemCraftDataHolder();