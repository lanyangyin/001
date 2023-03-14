class ShopDataHolder extends DataHolder
{
    constructor()
    {
        super("shopData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/shop/shopData.csv"]);
    }

    getDatasByRandom(whereArg = null)
    {
        var where = (data) =>
        {
            if (Type.toBoolean(data.once))
            {
                var item = globalSystem.houseManager.getItemById(data.item);
                if (item != null)
                {
                    return false;
                }
            }

            if (whereArg != null)
            {
                var result = whereArg(data);
                return result;
            }

            return true;
        };

        var correct = this.getDatasByWhere(where);
        if (correct.length == 0)
        {
            return null;
        }

        var result = Random.shuffle(correct);
        return result;
    }
}

new ShopDataHolder();