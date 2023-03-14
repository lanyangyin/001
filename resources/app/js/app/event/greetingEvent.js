class GreetingEvent extends Event
{
    constructor()
    {
        super("greeting", 0, 1);

        this.greetingTarget = null;
    }

    setupEvent(survivor, stage)
    {
        // 1/3の確率で発生しない
        // 繰り返しにしよる違和感を避けるため
        if (Random.range(3) == 0)
        {
            return;
        }

        for (var s of globalSystem.survivorManager.survivors)
        {
            if (s == survivor)
            {
                continue;
            }
            if (s.currentStage != stage)
            {
                continue;
            }

            this.greetingTarget = s;
            break;
        }

        if (this.greetingTarget != null)
        {
            survivor.speakWithArg(this.type, "A", []);
        }
    }

    executeEvent(survivor, stage)
    {
        if (this.greetingTarget == null)
        {
            return true;
        }

        this.greetingTarget.speakWithArg(this.type, "B", []);
        return true;
    }
}