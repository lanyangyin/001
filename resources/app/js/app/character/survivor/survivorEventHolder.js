class SurvivorEventHolder
{
    constructor()
    {
        this.events = [];
    }

    update(survivor)
    {
        if (this.events.length == 0)
        {
            return;
        }

        for (var event of this.events)
        {
            var probability = event.getProbability(survivor, this);
            if (probability > 1)
            {
                survivor.pushEvent(event, Event.executeType.event);
                return;
            }
        }

        for (var event of this.events)
        {
            var probability = event.getProbability(survivor, this);
            if (probability <= 0)
            {
                continue;
            }

            var rand = (Random.range(100) / 100.0);
            if (probability > rand)
            {
                survivor.pushEvent(event, Event.executeType.event);
            }
        }
    }

    reset()
    {
        this.events =
            [
                new ConfirmHealEvent(),
                new ConfirmEatEvent(),
            ];
    }
}
