class QuestStartEvent extends QuestEvent
{
    constructor(main = true, speakId = true)
    {
        super("questStart", 2, -1);
        this.main = main;
        this.speakId = speakId;

        this.talked = false;
        this.waitTimer = 2;
    }

    executeEvent(survivor, stage)
    {
        this.waitTimer -= globalSystem.time.deltaTime;
        if (this.waitTimer > 0)
        {
            return false;
        }

        var location = globalSystem.locationManager.location;
        if (StringExtension.isValid(this.speakId) && this.talked == false)
        {
            if (this.main)
            {
                survivor.speak(this.type, []);

                var index = globalSystem.areaManager.getIndex() + 1;
                survivor.speak(this.speakId, [index, location.name]);
                survivor.describe(location.describe, []);
            }
            else
            {
                survivor.speak(`${this.type}_sub`, []);
            }
            this.talked = true;
        }

        if (this.main)
        {
            survivor.insertEvent(new ArrivedLocationEvent(), Event.executeType.event);
            if (StringExtension.isValid(location.data.startEvent))
            {
                var startEvent = EventGenerator.generate(location.data.startEvent, location.data.startEventArgs);
                if (startEvent != null)
                {
                    survivor.insertEvent(startEvent, Event.executeType.event);
                }
            }
            survivor.insertEvent(new ArrivedLocationBeforeEvent(), Event.executeType.event);
            survivor.insertEvent(new MoveEvent([0, false]), Event.executeType.event);
        }
        else
        {
            survivor.insertEvent(new ArrivedLocationEvent(), Event.executeType.event);
            survivor.insertEvent(new ArrivedLocationBeforeEvent(), Event.executeType.event);
        }

        survivor.onQuestStart();

        return true;
    }

    isUseSurvivorSpeed()
    {
        return false;
    }

    getUseStamina()
    {
        return 0;
    }
}