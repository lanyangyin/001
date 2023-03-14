class ConfirmEnemyBossSurvivorEvent extends ConfirmEnemyBossEvent
{
    constructor(args)
    {
        super(args);
    }

    onYes(survivor, stage)
    {
        survivor.speak("confirmEnemyBossSuccess", []);
        survivor.insertEvent(new BattleBossSurvivorEvent(this.args), Event.executeType.event);
    }

    getConfirmSpeakId(survivor, stage)
    {
        return "confirmEnemyBossSurvivor";
    }

    getConfirmSpeakArg(survivor, stage)
    {
        var id = this.args[2];
        var emData = globalSystem.enemyData.getDataById(id);
        if (emData != null)
        {
            return [emData.name];
        }

        return [];
    }
}
