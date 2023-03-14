class SearchEvent extends AccessObjectEvent
{
    constructor(callObjectEvent)
    {
        super("search", 3, 1, callObjectEvent);
        this.searchWords = [this.object.keyword, this.object.name];
        this.describe = this.object.describe;
        this.events = this.object.events;
        this.resultEvent = null;
        this.image = this.object.image;
        this.isOverwriteResult = false;
    }

    setupEvent(survivor, stage)
    {
        this.resultEvent = this.createEvent(stage);

        var speak = null;
        var word = this.searchWords[0];
        if (this.object != null)
        {
            if (StringExtension.isValid(this.object.speak))
            {
                speak = this.object.speak;
            }
        }
        survivor.speak(speak, [word]);

        if (StringExtension.isNullOrEmpty(this.describe) == false)
        {
            survivor.describe(this.describe, []);
        }
        if (StringExtension.isValid(this.image))
        {
            globalSystem.uiManager.background.setImage(this.image, 1, 0.5);
        }
        globalSystem.cameraManager.focusBg();
    }

    executeEvent(survivor, stage)
    {
        if (this.resultEvent == null)
        {
            survivor.speak("nothing", []);
            return true;
        }

        this.resultEvent.parentEvent = this;
        survivor.insertEvent(this.resultEvent, Event.executeType.event);
        return true;
    }

    exitEvent(survivor, stage)
    {
        globalSystem.uiManager.background.fadeOut(0.5, 1);
    }

    createEvent(stage)
    {
        this.isOverwriteResult = false;

        if (stage != null)
        {
            // 上書き探索結果を使う
            var id = stage.popOverwriteSearchResult();
            if (id != null)
            {
                var event = EventGenerator.generateById(id);
                if (event != null && event.valid)
                {
                    this.isOverwriteResult = true;
                    return event;
                }
            }
        }

        var id = this.events[0];
        for (var event of this.events)
        {
            var rand = Random.range(2);
            if (rand == 0)
            {
                id = event;
                break;
            }
        }

        var result = EventGenerator.generateById(id);
        return result;
    }

    isRemoveObject()
    {
        var result = super.isRemoveObject();

        if (this.object == null)
        {
            return true;
        }

        if (this.resultEvent == null)
        {
            return true;
        }

        if (this.isOverwriteResult)
        {
            return true;
        }

        return result;
    }
}
