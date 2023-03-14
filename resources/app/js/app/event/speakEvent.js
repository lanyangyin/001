class SpeakEvent extends Event
{
    constructor(arg)
    {
        super("speak", 0, 1);

        this.speakType = arg[0];
        this.speakArgs = [];
        this.probability = 1;

        if (StringExtension.isValid(arg[1]))
        {
            this.speakArgs = arg[1].split("/");
        }

        if (StringExtension.isValid(arg[2]))
        {
            this.executeLimit = Number(arg[2]);
        }

        if (StringExtension.isValid(arg[3]))
        {
            this.probability = Number(arg[3]);
        }
    }

    executeEvent(survivor, stage)
    {
        survivor.speak(this.speakType, this.speakArgs);
        return true;
    }

    getProbability()
    {
        return this.probability;
    }

    isContinuable()
    {
        return true;
    }

    getUseStamina()
    {
        return 0;
    }
}
