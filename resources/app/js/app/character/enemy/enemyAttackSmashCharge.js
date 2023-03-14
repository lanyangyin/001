class EnemyAttackSmashCharge extends EnemyAttack
{
    constructor()
    {
        super();
    }

    execute(enemy, target)
    {
        target.speak("enemyCharging", [enemy.name]);
        enemy.reserveAttack(EnemyAttackSmash.name);
        globalSystem.soundManager.playSe("enemy06");
    }
}
