class EnemyAttackWait extends EnemyAttack
{
    constructor()
    {
        super();
    }

    execute(enemy, target)
    {
        target.speak("enemyWaiting", [enemy.name]);
        globalSystem.soundManager.playSe("enemy05");
    }
}
