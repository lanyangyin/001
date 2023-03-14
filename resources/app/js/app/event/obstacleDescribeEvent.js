class ObstacleDescribeEvent extends Event
{
    constructor(args)
    {
        super("obstacleDescribe", 0, 1);

        var call = args[0];
        var stage = args[1];

        this.callObjectEvent = call;
        this.obstacleEvent = this.createObstacleEvent(stage);
    }

    get tags()
    {
        var result = [];
        if (this.obstacleEvent != null)
        {
            result = result.concat(this.obstacleEvent.tags);
        }
        return result;
    }

    executeEvent(survivor, stage)
    {
        if (this.callObjectEvent == null)
        {
            return true;
        }

        if (this.callObjectEvent.isExecuteLimit)
        {
            return true;
        }

        var obstacle = this.createObstacleEvent(stage);
        if (obstacle == null)
        {
            return true;
        }

        obstacle.describe(survivor, this.callObjectEvent.object);
        this.callObjectEvent.beforeEvents.push(obstacle);

        return true;
    }

    createObstacleEvent(stage)
    {
        var ratio = parseFloat(stage.data.obstacleRatio);
        if (ratio == 0)
        {
            return null;
        }

        var random = Random.range(100) / 100.0;
        if (random > ratio)
        {
            return null;
        }

        var objectTypes = stage.data.objectTypes;
        var event = new ObstacleEvent(objectTypes);
        if (event.data == null)
        {
            return null;
        }

        return event;
    }
}
