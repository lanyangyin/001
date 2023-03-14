class Enemy extends Character
{
    constructor(data)
    {
        super(data);

        this.distance = Number(data.distance);
        this.attacks = [];
        this.attackReserves = [];

        this.setupAttacks(data);
    }

    attackRandom(target)
    {
        if (this.distance > 0)
        {
            target.speak("comeEnemy", [this.name]);
            globalSystem.soundManager.playSe("enemy05");
            this.distance--;
            return;
        }

        if (this.attackReserves.length > 0)
        {
            var attack = this.attackReserves.shift();
            if (attack != null)
            {
                attack.execute(this, target);
                return;
            }
        }

        for (var attack of this.attacks)
        {
            var rand = Random.range(2);
            if (rand == 0)
            {
                attack.execute(this, target);
                return;
            }
        }

        this.attacks[0].execute(this, target);
    }

    reserveAttack(type)
    {
        var attack = Class.getInstance(type);
        if (attack == null)
        {
            return;
        }

        this.attackReserves.push(attack);
    }

    clearReservedAttacks()
    {
        this.attackReserves = [];
    }

    setupAttacks(data)
    {
        for (var type of data.attackTypes)
        {
            var attack = Class.getInstance(type);
            if (attack == null)
            {
                continue;
            }
            this.attacks.push(attack);
        }
    }

    onDead(source)
    {
        super.onDead(source);

        for (var attack of this.attacks)
        {
            attack.onDead(this, source);
        }
    }
}
