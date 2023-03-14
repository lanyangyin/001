class ConfirmEnemyBossEvent extends ConfirmEvent
{
    constructor(args)
    {
        super(-1);

        this.args = args;
    }

    getYesInputs()
    {
        return ["yes", "go"];
    }

    getNoInputs()
    {
        return ["no", "return"];
    }

    onYes(survivor, stage)
    {
        survivor.speak("confirmEnemyBossSuccess", []);
        survivor.insertEvent(new BattleBossEvent(this.args), Event.executeType.event);
    }

    onNo(survivor, stage)
    {
        survivor.speak("confirmEnemyBossCancel", []);
        survivor.insertEvent(new ReturnGatewayEvent(false, false), Event.executeType.event);
    }

    getConfirmSpeakId(survivor, stage)
    {
        return "confirmEnemyBoss";
    }

    getConfirmSpeakArg(survivor, stage)
    {
        return [];
    }

    getConfirmFailedSpeakId(survivor, stage)
    {
        return "confirmEnemyBossFailed";
    }
}
