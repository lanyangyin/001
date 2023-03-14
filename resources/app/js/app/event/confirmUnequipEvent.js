class ConfirmUnequipEvent extends ConfirmEvent
{
    constructor(args)
    {
        super("confirmUnequip", 1, 1);

        this.item = args[0];
    }

    executeEvent(survivor, stage)
    {
        if (this.item == null)
        {
            return true;
        }

        if (survivor.hasItem(this.item) == false)
        {
            return true;
        }

        return super.executeEvent(survivor, stage);
    }

    getYesInputs()
    {
        return ["yes", "unequip"];
    }

    getNoInputs()
    {
        return ["no", "stay"];
    }

    onYes(survivor, stage)
    {
        if (this.item == null)
        {
            return;
        }

        survivor.unequipWeapon(this.item);
        survivor.unequipArmor(this.item);
    }

    onNo(survivor, stage)
    {
        /* nop */
    }

    getConfirmSpeakId(survivor, stage)
    {
        return "confirmUnequip";
    }

    getConfirmSpeakArg(survivor, stage)
    {
        if (this.item == null)
        {
            return [];
        }
        return [this.item.name];
    }

    isContinuable()
    {
        return true;
    }

    isSkippable(survivor, stage)
    {
        return true;
    }
}
