class LocationSpeakEvent extends Event
{
    constructor(arg)
    {
        super("locationSpeak", 0, 1);
    }

    executeEvent(survivor, stage)
    {
        var datas = globalSystem.speakData.getDatasByTypeArg("location", stage.type);
        if (datas.length == 0)
        {
            return true;
        }

        var index = Random.range(datas.length);
        var data = datas[index];
        if (data == null)
        {
            return true;
        }

        var id = `${data.id}_${survivor.id}`;
        if (globalSystem.questManager.isUsedDescribe(id))
        {
            return true;
        }

        var text = data[survivor.id];
        if (StringExtension.isNullOrEmpty(text))
        {
            return true;
        }

        var texts = text.split("<br>");
        for (var t of texts)
        {
            survivor.speak("talk", [t]);
        }

        globalSystem.questManager.notifyUsedDescribe(id);

        return true;
    }
}