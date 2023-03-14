class EnemyAttackSteal extends EnemyAttack
{
    constructor()
    {
        super();

        this.stoles = [];
    }

    execute(enemy, target)
    {
        var stole = this.steal(target);
        if (stole != null)
        {
            var data = { owner: target, item: stole };
            this.stoles.push(data);
            target.speak("enemyStealItem", [enemy.name, stole.name]);
            globalSystem.soundManager.playSe("miss00");
        }
        else
        {
            target.speak("enemyWaiting", [enemy.name]);
            globalSystem.soundManager.playSe("enemy05");
        }
    }

    onDead(enemy, target)
    {
        if (this.stoles.length == 0)
        {
            return;
        }

        for (var data of this.stoles)
        {
            if (data.owner == null)
            {
                continue;
            }
            if (data.item == null)
            {
                continue;
            }
            data.owner.pushItem(data.item);
        }
        if (target != null)
        {
            target.speak("takeBackItems", []);
        }
    }

    steal(target)
    {
        var random = Random.range(100) / 100.0;
        if (random > 0.5)
        {
            return null;
        }

        if (target == null)
        {
            return null;
        }

        if (target.inventory == null)
        {
            return null;
        }

        var count = target.inventory.itemCount;
        if (count == 0)
        {
            return null;
        }

        var index = Random.range(count);
        var item = target.inventory.list[index];
        if (item == null)
        {
            return null;
        }
        if (Type.toBoolean(item.lost) == false)
        {
            return null;
        }

        if (target.removeItem(item))
        {
            return item;
        }
        return null;
    }
}
