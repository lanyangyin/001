class LocationOption
{
    constructor(args)
    {
        /* nop */
    }

    setup(location)
    {
        this.setupOption(location);
    }

    execute(location)
    {
        this.executeOption(location);
    }

    onVisitStage(location, stage)
    {
        this.onVisit(location, stage);
    }

    setupOption(location)
    {
        /* nop */
    }

    executeOption(location)
    {
        /* nop */
    }

    onVisit(location, stage)
    {
        /* nop */
    }
}
