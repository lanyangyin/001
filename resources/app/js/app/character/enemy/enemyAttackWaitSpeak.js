class EnemyAttackWaitSpeak extends EnemyAttack
{
    constructor()
    {
        super();
    }

    execute(enemy, target)
    {
        var correct = globalSystem.speakData.getDatasByKey("type", "battle_wait");
        if (correct.length > 0)
        {
            var data = correct[Random.range(correct.length)];
            var text = `「${data[enemy.data.context]}」`;
            globalSystem.uiManager.textLine[target.index].writeLine(text, enemy.name, Color.marineBlue, true);
        }
    }
}
