class EnemyAttack
{
    constructor()
    {
        /* nop */
    }

    execute(enemy, target)
    {
        enemy.attack(target);
        globalSystem.soundManager.playSe("attack01");
    }

    onDead(enemy, target)
    {
        /* nop */
    }
}
