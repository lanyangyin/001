class BattleBossEvent extends BattleEvent
{
    constructor(args)
    {
        super(args);

        this.confirmEscape = false;
    }

    exitEvent(survivor, stage)
    {
        super.exitEvent(survivor, stage);

        var location = globalSystem.locationManager.location;
        if (location != null)
        {
            var noBattle = new LocationOptionNoBattle();
            location.pushOption(noBattle);
        }
    }

    cancel()
    {
        super.cancel();

        // ボス戦はキャンセル不可
        this.canceled = false;
    }

    checkEscape(survivor)
    {
        var result = { escape: false, checking: false };
        if (this.turnCount == 0)
        {
            return result;
        }

        if ((this.turnCount % 15) != 0)
        {
            return result;
        }

        result.checking = true;

        if (this.confirmEscape == false)
        {
            survivor.speak("confirmEscapeBattleBoss", []);
            this.confirmEscape = true;
        }

        globalSystem.uiManager.textLine[survivor.index].setState(TextLine.state.waiting);

        var input = globalSystem.uiManager.textInput[survivor.index].getConverted();
        var text = globalSystem.uiManager.textInput[survivor.index].text;
        if (StringExtension.isNullOrEmpty(input))
        {
            return result;
        }

        globalSystem.uiManager.textInput[survivor.index].reset();
        if (input == "escape")
        {
            globalSystem.uiManager.textLine[survivor.index].writeInput(text);
            survivor.speak("confirmSuccess", []);
            this.confirmEscape = false;
            survivor.speak("confirmEnemyBossCancel", []);
            survivor.insertEvent(new ReturnGatewayEvent(false, false), Event.executeType.event);

            result.escape = true;
            return result;
        }
        else if (input == "battle")
        {
            globalSystem.uiManager.textLine[survivor.index].writeInput(text);
            survivor.speak("confirmSuccess", []);
            this.confirmEscape = false;
            this.turnCount++;

            result.escape = false;
            return result;
        }

        return result;
    }
}