class QuestSuccessEvent extends QuestEndEvent
{
    constructor(speak = true, checkNextLocation = true)
    {
        super("questSuccess", 0, -1);
        this.speak = speak;
        this.checkNextLocation = checkNextLocation;
    }

    setupEvent(survivor, stage)
    {
        // 他の生存者を停止させる
        for (var s of globalSystem.survivorManager.survivors)
        {
            if (s == null)
            {
                continue;
            }
            if (s == survivor)
            {
                continue;
            }
            s.pushEvent(new StopEvent(), Event.executeType.event);
        }
    }

    executeEvent(survivor, stage)
    {
        // 他の生存者が停止するまで待つ
        for (var s of globalSystem.survivorManager.survivors)
        {
            if (s == survivor)
            {
                continue;
            }
            if (s.currentEvent == null)
            {
                return false;
            }
            if ((s.currentEvent instanceof StopEvent) == false)
            {
                return false;
            }
        }

        globalSystem.survivorManager.lock(survivor);

        // 予約イベントを破棄
        survivor.clearNextEvents();

        var quest = globalSystem.questManager.currentQuest;
        var scenario = globalSystem.questManager.currentScenario;

        if (this.speak)
        {
            var questSuccess = quest.success;
            survivor.speak(`${this.type}_${questSuccess}`, []);
            globalSystem.cameraManager.focusResetFg();
        }

        var isLast = globalSystem.areaManager.isLastLocation;
        if (isLast == false && this.checkNextLocation)
        {
            survivor.pushEvent(new CheckNextLocationEvent(), Event.executeType.event);
        }
        else
        {
            var onEnd = null;
            if (scenario != null)
            {
                onEnd = QuestExecutor.onEndScenario;
            }
            var event = EventGenerator.generate(quest.successEvent, quest.successEventArgs, onEnd);
            if (event != null)
            {
                survivor.pushEvent(event, Event.executeType.event);
            }
        }

        return true;
    }

    isSkipTimer()
    {
        return true;
    }

    isUseSurvivorSpeed()
    {
        return false;
    }

    getUseStamina()
    {
        return 0;
    }
}