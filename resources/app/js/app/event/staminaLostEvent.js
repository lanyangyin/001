class StaminaLostEvent extends Event
{
    constructor(args)
    {
        super("staminaLost", 3, 1);

        this.staminaLost = false;
    }

    setupEvent(survivor, stage)
    {
        this.checkStamina();

        if (this.staminaLost == false)
        {
            return;
        }

        survivor.speak("staminaLost", []);
        globalSystem.survivorManager.lock(survivor);

        // 今回の探索で獲得したアイテムのロスト
        var survivors = globalSystem.survivorManager.survivors;
        for (var survivor of survivors)
        {
            survivor.inventory.lostTemporary();
        }
    }

    executeEvent(survivor, stage)
    {
        if (this.staminaLost == false)
        {
            return true;
        }

        globalSystem.questManager.setQuestFailedFlow(new GatewayFlow());
        globalSystem.questManager.failed(false);
        return true;
    }

    exitEvent(survivor, stage)
    {
        globalSystem.survivorManager.unlock(survivor);
    }

    checkStamina()
    {
        this.staminaLost = false;

        for (var survivor of globalSystem.survivorManager.survivors)
        {
            if (survivor.stamina <= 0)
            {
                this.staminaLost = true;
                break;
            }
        }
    }
}
