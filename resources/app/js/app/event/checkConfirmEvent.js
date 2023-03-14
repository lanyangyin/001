class CheckConfirmEvent extends ConfirmEvent
{
    constructor(arg)
    {
        super(1);

        this.checkResult = [arg[0], arg[1], arg[2]];
    }

    setupEvent(survivor, stage)
    {
        super.setupEvent(survivor, stage);

        globalSystem.cameraManager.focusSurvivor(survivor);
    }

    exitEvent(survivor, stage)
    {
        super.exitEvent(survivor, stage);

        globalSystem.cameraManager.focusReset();
    }

    onYes(survivor, stage)
    {
        var eventType = this.selectResult();
        if (eventType == null)
        {
            return true;
        }

        var event = EventGenerator.generateById(eventType);
        if (event == null)
        {
            return true;
        }

        survivor.insertEvent(event, Event.executeType.event);
    }

    onNo(survivor, stage)
    {
        return;
    }

    getYesInputs()
    {
        return ["yes", "search", "look"];
    }

    getConfirmSpeakId(survivor, stage)
    {
        return "checkConfirm";
    }

    getConfirmSpeakArg(survivor, stage)
    {
        return [];
    }

    selectResult()
    {
        for (var event of this.checkResult)
        {
            var rand = Random.range(2);
            if (rand == 0)
            {
                return event;
            }
        }

        return this.checkResult[0];
    }

    getUseStamina()
    {
        return 3;
    }
}
