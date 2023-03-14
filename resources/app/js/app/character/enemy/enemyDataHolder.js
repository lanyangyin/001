class EnemyDataHolder extends DataHolder
{
    constructor()
    {
        super("enemyData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/character/enemyData.csv"]);
    }

    getRandomByLevel(level, type = "default")
    {
        var correct = this.getDatasByWhere((item) =>
        {
            if (Number(item.level) > Number(level))
            {
                return false;
            }
            if (item.type != type)
            {
                return false;
            }
            if (parseFloat(item.ratio) <= 0)
            {
                return false;
            }
            var area = globalSystem.areaManager.area;
            if (StringExtension.isValid(item.area) && item.area != area)
            {
                return false;
            }
            return true;
        });
        if (correct.length == 0)
        {
            return null;
        }

        correct = Random.shuffle(correct);
        for (var enemy of correct)
        {
            var ratio = parseFloat(enemy.ratio);
            if (ratio <= 0)
            {
                continue;
            }

            var random = Random.range(100) / 100.0;
            if (random < ratio)
            {
                return enemy;
            }
        }
        return correct[0];
    }
}

new EnemyDataHolder();
