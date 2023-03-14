class ChatTogetherEvent extends Event
{
    constructor()
    {
        super("chatTogether", 0, 1);

        this.talkId = null;
        this.line = null;
        this.currentIndex = 0;
        this.completed = false;
    }

    setupEvent(survivor, stage)
    {
        var survivors = globalSystem.survivorManager.survivors;
        var list = globalSystem.chatData.getDatasByCharacters(survivors);
        if (list.length == 0)
        {
            return;
        }

        var list = Random.shuffle(list);
        var chatData = null;
        for (var data of list)
        {
            if (globalSystem.eventManager.isChatFinished(data.id))
            {
                continue;
            }

            chatData = data;
            break;
        }

        if (chatData == null)
        {
            return;
        }

        if (chatData.firstSpeaker != survivor.id)
        {
            return;
        }

        this.talkId = chatData.talkId;
        this.line = globalSystem.talkData.getDatasById(this.talkId);

        globalSystem.survivorManager.lock(survivor);
    }

    executeEvent(survivor, stage)
    {
        if (this.line == null)
        {
            return true;
        }

        if (this.line.length == 0)
        {
            return true;
        }

        var data = this.line[this.currentIndex];
        if (data == null)
        {
            return true;
        }

        var result = this[data.command](data);
        if (result)
        {
            this.completed = true;
        }

        this.currentIndex++;

        return result;
    }

    exitEvent(survivor, stage)
    {
        globalSystem.survivorManager.unlock(survivor);

        if (this.completed)
        {
            globalSystem.eventManager.notifyChatFinished(this.talkId);
        }
    }

    talk(data)
    {
        var id = data.arg0;
        var speaker = null;
        for (var survivor of globalSystem.survivorManager.survivors)
        {
            if (survivor.id == id)
            {
                speaker = survivor;
            }
        }

        var text = data.arg1;
        speaker.speak("talk", [text]);

        return false;
    }

    end(data)
    {
        return true;
    }
}