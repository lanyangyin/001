class ConfirmEnterBaseCampEvent extends ConfirmEvent
{
    constructor(args)
    {
        super(-1);

        this.scenarioId = args[0];
        this.area = args[1];
        this.areaGroup = args[2];
        this.isEnter = false;
    }

    exitEvent(survivor, stage)
    {
        super.exitEvent(survivor, stage);

        if (this.isEnter)
        {
            survivor.insertEvent(new ReturnGatewayEvent(false, true), Event.executeType.event);
            survivor.insertEvent(new ItemGetBonusEvent(["enterBaseCamp"]), Event.executeType.event);
            survivor.insertEvent(new CheckNextDestinationEvent(), Event.executeType.event);
        }
        else
        {
            survivor.pushEvent(new CheckNextLocationEvent(), Event.executeType.event);
        }
    }

    getYesInputs()
    {
        return ["yes", "camping"];
    }

    getNoInputs()
    {
        return ["no"];
    }

    onYes(survivor, stage)
    {
        this.isEnter = true;

        globalSystem.scenarioManager.setStoryScenario(this.scenarioId);
        globalSystem.areaManager.setGroup(this.area, this.areaGroup);
        globalSystem.areaManager.clearOpendLocations(this.area);
        globalSystem.questManager.setQuestTimes(-1);
        globalSystem.endlessManager.incrementBaseCampCount();
    }

    onNo(survivor, stage)
    {
        this.isEnter = false;
        survivor.speak("leaveBaseCamp", []);
    }

    getConfirmSpeakId(survivor, stage)
    {
        return "confirmEnterBaseCamp";
    }

    getConfirmSpeakArg(survivor, stage)
    {
        return [];
    }
}