class LocationOptionExitBroken extends LocationOption
{
    constructor(args)
    {
        super(args);

        this.ratio = Number(args[0]);
    }

    setupOption(location)
    {
        var random = Random.range(100) / 100.0;
        if (random < parseFloat(this.ratio))
        {
            var exitStages = [];
            for (var stage of location.stages)
            {
                for (var nextIndex of stage.nextIndex)
                {
                    if (nextIndex == -1)
                    {
                        exitStages.push(stage);
                        break;
                    }
                }
            }

            if (exitStages.length > 1)
            {
                var exitIndex = Random.range(exitStages.length);
                for (var i = 0; i < exitStages.length; i++)
                {
                    if (i == exitIndex)
                    {
                        continue;
                    }
                    exitStages[i].exitBroken = true;
                }
            }
        }
    }
}
