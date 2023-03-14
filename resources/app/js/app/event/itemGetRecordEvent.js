class ItemGetRecordEvent extends Event
{
    constructor(args)
    {
        super("itemGetRecord", 2, 1);

        this.speakId = args[0];
    }

    setupEvent(survivor, stage)
    {
        var count = globalSystem.areaManager.currentIndex + 1;
        var item = this.getRecordItem(count);
        if (item == null)
        {
            return;
        }

        globalSystem.houseManager.pushItem(item, false);
        survivor.speak(this.speakId, [count]);
    }

    getRecordItem(count)
    {
        var records = globalSystem.itemData.getDatasByKey("type", "record");
        if (records.length == 0)
        {
            return null;
        }

        var result = records[0];
        for (var i = records.length - 1; i >= 0; i--)
        {
            var record = records[i];
            var threshold = Number(record.arg0);
            if (count >= threshold)
            {
                result = record;
                break;
            }
        }

        if (record != null)
        {
            var variable = "";
            for (var survivor of globalSystem.survivorManager.survivors)
            {
                variable += survivor.id;
                variable += "/";
            }
            variable += count;

            record.variable = variable;
        }

        return record;
    }
}
