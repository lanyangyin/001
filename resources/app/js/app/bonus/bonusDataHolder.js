class BonusDataHolder extends DataHolder
{
    constructor()
    {
        super("bonusData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/bonus/bonusData.csv"]);
    }

    getRandomByType(type)
    {
        // 指定typeのものから抽選
        var correct = this.getDatasByWhere((item) =>
        {
            if (StringExtension.isNullOrEmpty(item.type))
            {
                return false;
            }

            if (item.type != type)
            {
                return false;
            }

            if (StringExtension.isValid(item.countMax))
            {
                var max = Number(item.countMax);
                var hasItems = globalSystem.houseManager.getItemsById(item.item);
                if (hasItems.length >= max)
                {
                    return false;
                }
            }

            return true;
        });
        if (correct.length > 0)
        {
            var index = Random.range(correct.length);
            var result = correct[index];
            return result;
        }

        // type指定のないものから抽選
        var noTypes = this.getDatasByWhere((item) =>
        {
            if (StringExtension.isNullOrEmpty(item.type))
            {
                return true;
            }
            return false;
        });
        if (noTypes.length > 0)
        {
            var index = Random.range(noTypes.length);
            var result = noTypes[index];
            return result;
        }

        return null;
    }
}

new BonusDataHolder();
