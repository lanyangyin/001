class ChatEvent extends Event
{
    constructor()
    {
        super("chat", 0, -1);

        this.chatList = [];
    }

    executeEvent(survivor, stage)
    {
        var correct = [];
        for (var chat of this.chatList)
        {
            if (this.callWord == chat.arg0)
            {
                correct.push(chat);
            }
        }

        if (correct.length == 0)
        {
            return false;
        }

        var index = Random.range(correct.length);
        var data = correct[index];
        var text = data[survivor.id];
        if (text == null)
        {
            return true;
        }

        survivor.speak("talk", [text]);

        return true;
    }

    getCallWords(survivor, stage)
    {
        this.chatList = [];
        var result = [];

        for (var data of globalSystem.speakData.datas[0])
        {
            if (data.type == this.type)
            {
                this.chatList.push(data);
                result.push(data.arg0);
            }
        }

        return result;
    }

    isCallWordIncludes()
    {
        return true;
    }
}
