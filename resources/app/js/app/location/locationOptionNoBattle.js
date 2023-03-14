class LocationOptionNoBattle extends LocationOption
{
    constructor()
    {
        super();
    }

    setupOption(location)
    {
        for (var stage of location.stages)
        {
            stage.pushOption(new StageOptionNoBattle());
        }
    }
}
