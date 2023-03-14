class SurvivorCallHandler
{
    constructor()
    {
        this.events = [];
        this.history = [];
        this.lost = [];
        this.post = [];
        this.has = [];
    }

    update(survivor)
    {
        if (globalSystem.uiManager.textLine[survivor.index].currentState == TextLine.state.waiting)
        {
            return;
        }

        if (globalSystem.survivorManager.locking)
        {
            return;
        }

        if (survivor.isDead)
        {
            return;
        }

        if (survivor.currentStage == null)
        {
            return;
        }

        var input = globalSystem.uiManager.textInput[survivor.index].getConverted();
        var inputContains = globalSystem.uiManager.textInput[survivor.index].getConverted(true);
        var text = globalSystem.uiManager.textInput[survivor.index].text;
        if (StringExtension.isNullOrEmpty(input))
        {
            return;
        }

        // 入力内容をテキストラインに追加
        globalSystem.uiManager.textLine[survivor.index].writeInput(text);
        globalSystem.uiManager.textInput[survivor.index].reset();

        var callEvent = null;
        var callWord = null;

        // 部屋に登録されたイベントを検索
        if (callEvent == null)
        {
            var stage = survivor.currentStage;
            if (stage != null)
            {
                for (var event of stage.events)
                {
                    var word = this.getCalledWord(input, inputContains, event, survivor);
                    if (word != null)
                    {
                        callEvent = event;
                        callWord = word;
                        break;
                    }
                }
            }
        }

        // 呼び出しイベント検索
        if (callEvent == null)
        {
            for (var event of this.events)
            {
                var word = this.getCalledWord(input, inputContains, event, survivor);
                if (word != null)
                {
                    callEvent = event;
                    callWord = word;
                    break;
                }
            }
        }

        // すでに発行されているイベントに同様のCallWordをもつものがあれば無視
        if (callEvent == null)
        {
            if (this.isAlreadyEvent(survivor, input))
            {
                survivor.speak("callAlready", []);
                return;
            }
        }

        // 登録済みのinputなら専用のセリフを出す
        if (callEvent == null)
        {
            if (this.checkRegisteredEvent(input, survivor))
            {
                return;
            }
        }

        // 呼び出しイベントが見つからなかった
        if (callEvent == null)
        {
            survivor.speak("callFailed", []);
            return;
        }

        // イベント登録
        callEvent.call(callWord);
        survivor.insertEvent(callEvent, Event.executeType.call);

        // 1回きりのイベントなら、コールリストから削除
        if (callEvent.executeLimit == 1)
        {
            this.events = List.remove(this.events, callEvent);
        }
    }

    reset()
    {
        this.events =
            [
                new ItemUseEvent(),
                new ChatEvent(),
            ];
        this.history = [];
        this.lost = [];
        this.post = [];
        this.has = [];
    }

    isAlreadyEvent(survivor, input)
    {
        if (survivor.currentEvent != null)
        {
            var words = survivor.currentEvent.getCallWords(survivor, survivor.currentStage);
            for (var word of words)
            {
                if (word == input)
                {
                    return true;
                }
            }
        }

        for (var next of survivor.nextEvents)
        {
            var words = next.getCallWords(survivor, survivor.currentStage);
            for (var word of words)
            {
                if (word == input)
                {
                    return true;
                }
            }
        }

        return false;
    }

    checkRegisteredEvent(input, survivor)
    {
        // 後回しリストにあるテキストなら専用のセリフ
        if (this.isPostEvent(input))
        {
            survivor.speak("callPost", []);
            return true;
        }

        // 持っているリストにあるテキストなら専用のセリフ
        if (this.isHasEvent(input))
        {
            survivor.speak("callHas", []);
            return true;
        }

        // 履歴にあるテキストなら専用のセリフ
        if (this.isHistoryEvent(input))
        {
            survivor.speak("callHistoryed", []);
            return true;
        }

        // 喪失リストにあるテキストなら専用のセリフ
        if (this.isLostEvent(input))
        {
            survivor.speak("callLost", []);
            return true;
        }

        return false;
    }

    getCalledWord(input, inputContains, event, survivor)
    {
        var checkText = input;
        if (event.isCallWordIncludes())
        {
            checkText = inputContains;
        }
        var words = event.getCallWords(survivor, survivor.currentStage);
        for (var word of words)
        {
            if (word == checkText)
            {
                return word;
            }
        }
        return null;
    }

    isHistoryEvent(input)
    {
        for (var history of this.history)
        {
            if (input == history)
            {
                return true;
            }
        }
        return false;
    }

    isLostEvent(input)
    {
        for (var lost of this.lost)
        {
            if (input == lost)
            {
                return true;
            }
        }
        return false;
    }

    isPostEvent(input)
    {
        for (var post of this.post)
        {
            if (input == post)
            {
                return true;
            }
        }
        return false;
    }

    isHasEvent(input)
    {
        for (var has of this.has)
        {
            if (input == has)
            {
                return true;
            }
        }
        return false;
    }

    static registerHistory(callEvent)
    {
        if (callEvent == null)
        {
            return;
        }

        for (var survivor of globalSystem.survivorManager.survivors)
        {
            var words = callEvent.getCallWords(survivor, survivor.currentStage);
            if (words.length == 0)
            {
                continue;
            }
            for (var word of words)
            {
                survivor.eventExecutor.callHandler.history.push(word);
            }
        }
    }

    static unregisterHistory(callEvent)
    {
        if (callEvent == null)
        {
            return;
        }

        for (var survivor of globalSystem.survivorManager.survivors)
        {
            var words = callEvent.getCallWords(survivor, survivor.currentStage);
            if (words.length == 0)
            {
                continue;
            }
            for (var word of words)
            {
                survivor.eventExecutor.callHandler.history = List.remove(survivor.eventExecutor.callHandler.history, word, true);
            }
        }
    }

    static registerLost(callEvent)
    {
        if (callEvent == null)
        {
            return;
        }

        for (var survivor of globalSystem.survivorManager.survivors)
        {
            var words = callEvent.getCallWords(survivor, survivor.currentStage);
            if (words.length == 0)
            {
                continue;
            }
            for (var word of words)
            {
                survivor.eventExecutor.callHandler.lost.push(word);
            }
        }
    }

    static registerPost(callEvent)
    {
        if (callEvent == null)
        {
            return;
        }

        for (var survivor of globalSystem.survivorManager.survivors)
        {
            var words = callEvent.getCallWords(survivor, survivor.currentStage);
            if (words.length == 0)
            {
                continue;
            }
            for (var word of words)
            {
                survivor.eventExecutor.callHandler.post.push(word);
            }
        }
    }

    static registerHas(word)
    {
        if (word == null)
        {
            return;
        }

        for (var survivor of globalSystem.survivorManager.survivors)
        {
            survivor.eventExecutor.callHandler.has.push(word);
        }
    }
}
