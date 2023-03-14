class BridgeDescribeEvent extends Event
{
    constructor(nextIndexs)
    {
        super("bridgeDescribe", 0, 1);
        this.nextStageIndexs = nextIndexs;
    }

    executeEvent(survivor, stage)
    {
        var count = this.nextStageIndexs.length;
        var list = globalSystem.stageDescribeData.getDatasByType("bridge", count);
        var data = list[0];

        var bridges = [];
        for (var nextIndex of this.nextStageIndexs)
        {
            if (nextIndex == -1)
            {
                var location = globalSystem.locationManager.location;
                var outside = location.outside;
                if (StringExtension.isValid(outside))
                {
                    var bridge = `<button>${outside}</button>`;
                    bridges.push(bridge);

                    var confirm = new ConfirmMoveOutsideEvent([outside]);
                    stage.pushEvent(confirm);
                    var move = new MoveOutsideEvent();
                    move.broken = stage.exitBroken;
                    stage.pushEvent(move);
                    //this.pushCallEvent(move);
                }
            }
            else
            {
                var next = globalSystem.locationManager.getStage(nextIndex);
                var bridge = `<button>${next.bridge}</button>`;
                bridges.push(bridge);

                var move = new MoveEvent([nextIndex, true]);
                stage.pushEvent(move);
                this.pushCallEvent(move);
            }
        }

        if (bridges.length > 0)
        {
            survivor.describe(data.text, bridges);
        }

        return true;
    }

    pushCallEvent(event)
    {
        for (var survivor of globalSystem.survivorManager.survivors)
        {
            if (survivor == null)
            {
                continue;
            }
            survivor.pushCallEvent(event);
        }
    }

    getProbability()
    {
        return 2;
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
