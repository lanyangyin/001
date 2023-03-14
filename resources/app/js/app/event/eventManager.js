class EventManager extends GlobalManager
{
    constructor()
    {
        super("eventManager");

        this.finishedChat = [];
    }

    isChatFinished(id)
    {
        for (var finished of this.finishedChat)
        {
            if (id == finished)
            {
                return true;
            }
        }
        return false;
    }

    notifyChatFinished(id)
    {
        if (this.finishedChat.indexOf(id) != -1)
        {
            return;
        }
        this.finishedChat.push(id);
    }
}

new EventManager();
