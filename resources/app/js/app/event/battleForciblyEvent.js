class BattleForciblyEvent extends BattleEvent
{
    constructor(args)
    {
        super(args);
    }

    getProbability(survivor, stage)
    {
        return 2;
    }

    isContinuable()
    {
        return true;
    }

    getUseStamina()
    {
        return 2;
    }
}