class EnemyAttackSmash extends EnemyAttack
{
    constructor()
    {
        super();
    }

    execute(enemy, target)
    {
        target.speak("enemySmashing", [enemy.name]);

        var currentAtkRatio = enemy.atkRatio;
        enemy.atkRatio = 2;
        enemy.attack(target);
        enemy.atkRatio = currentAtkRatio;

        globalSystem.soundManager.playSe("attack02");
    }
}
