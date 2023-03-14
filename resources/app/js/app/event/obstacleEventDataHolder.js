class ObstacleEventDataHolder extends DataHolder
{
    constructor()
    {
        super("obstacleData");
    }

    setup()
    {
        this.setupPath(["resources/data/default/event/obstacleEventData.csv"]);
    }
}

new ObstacleEventDataHolder();
