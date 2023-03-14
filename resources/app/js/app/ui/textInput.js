class TextInput extends UIElement
{
    constructor(index)
    {
        super("textInput", index);
        this.index = index;
        this.textBox = null;
        this.button = null;
        this.historyButton = null;
        this.text = null;
        this.inputValue = null;
        this.isFocus = false;
        this.currentHistoryIndex = -1;
        this.locked = false;
        this.invalidTimer = 0;
        this.animator = new Animator();
        this.textBoxAnim = null;
        this.buttonAnim = null;
        this.historyButtonAnim = null;
        this.isHistoryOpened = false;
        this.isHistryEnabled = true;
        this.historyCloseDelay = -1;
    }

    static get maxLength()
    {
        return 1000;
    }

    static get invalidChar()
    {
        var result =
            [
                "<",
            ];
        return result;
    }

    static get invalidText()
    {
        var result =
            [
                " ",
                "　",
            ];
        return result;
    }

    static get validCallEvents()
    {
        var result =
            [
                MoveEvent,
                MoveOutsideEvent,
            ];
        return result;
    }

    get isEmpty()
    {
        var result = StringExtension.isNullOrEmpty(this.textBox.value);
        return result;
    }

    get history()
    {
        var result = [];
        var survivor = globalSystem.survivorManager.getSurvivor(this.index);
        if (survivor == null)
        {
            return result;
        }

        var events = survivor.eventExecutor.callHandler.events;
        if (events != null)
        {
            for (var event of events)
            {
                var valid = false;
                for (var type of TextInput.validCallEvents)
                {
                    if (event instanceof type)
                    {
                        valid = true;
                        break;
                    }
                }
                if (valid == false)
                {
                    continue;
                }
                var words = event.getCallWords(survivor, survivor.currentStage);
                if (words.length > 0 && result.indexOf(words[0]) == -1)
                {
                    var word = words[0];
                    if (event instanceof MoveEvent)
                    {
                        var stage = globalSystem.locationManager.getStage(event.nextStageIndex);
                        if (stage != null)
                        {
                            if (survivor.currentStage == stage)
                            {
                                word += Terminology.get("inputHistory_current");
                            }
                            else if (stage.visitCount > 0)
                            {
                                word += Terminology.get("inputHistory_explored");
                            }
                            else
                            {
                                word += Terminology.get("inputHistory_unexplored");
                            }
                        }
                    }
                    const pushItem = { word: word, input: words[0] };
                    result.push(pushItem);
                }
            }
        }

        var stage = survivor.currentStage;
        if (stage != null)
        {
            for (var event of stage.events)
            {
                var words = event.getCallWords(survivor, survivor.currentStage);
                if (words.length > 0 && result.indexOf(words[0]) == -1)
                {
                    const pushItem = { word: words[0], input: words[0] };
                    result.push(pushItem);
                }
            }
        }

        return result;
    }

    setup()
    {
        this.textBox = document.getElementById(`questInput${this.index}`);
        this.button = document.getElementById(`questSend${this.index}`);
        this.historyButton = document.getElementById(`questInputHistory${this.index}`);

        this.textBox.style.opacity = 1;
        this.button.style.opacity = 1;
        this.historyButton.style.opacity = 1;

        this.textBox.onclick = (event) =>
        {
            event.stopPropagation();
        };

        this.textBox.onfocus = (event) =>
        {
            this.onFocus(event);
        };

        this.textBox.onblur = (event) =>
        {
            this.onBlur(event);
        };

        this.historyButton.onclick = (event) =>
        {
            this.isHistryEnabled = true;
            this.openHistory();
            event.stopPropagation();
        };

        if (Platform.isMobile)
        {
            this.textBox.type = "button";
            this.textBox.onclick = (function (textinput)
            {
                return function (event)
                {
                    globalSystem.time.pause();
                    var input = prompt();
                    globalSystem.time.resume();
                    textinput.inputValue = input;
                    event.stopPropagation();
                };
            })(this);
        }
        else
        {
            this.button.onclick = (function (textinput)
            {
                return function (event)
                {
                    textinput.onClick(event);
                };
            })(this);
            document.body.addEventListener('keydown', (function (textinput)
            {
                return function (event)
                {
                    textinput.onKeyDown(event);
                };
            })(this));
        }

        globalSystem.textInputManager.register(this);
    }

    update()
    {
        this.animator.update();

        this.updateElements();
        this.updateHistory();

        if (this.inputValue != null)
        {
            this.text = this.inputValue;
            this.inputValue = null;
            this.currentHistoryIndex = -1;
        }
    }

    reset()
    {
        this.text = null;
        this.inputValue = null;
        this.textBox.value = StringExtension.empty;
    }

    lock()
    {
        this.locked = true;
    }

    unlock()
    {
        this.locked = false;
    }

    updateElements()
    {
        var valid = this.checkValid();
        if (valid)
        {
            this.invalidTimer = 0;
        }
        else
        {
            this.invalidTimer += globalSystem.time.deltaTime;
        }

        var time = 0.5;
        var invalidOpacity = 0.5;
        var opacity = parseFloat(this.textBox.style.opacity);
        if (this.invalidTimer < 0.5)
        {
            if (opacity < 1 && this.animator.isAnimation == false)
            {
                this.textBoxAnim = this.animator.opacity(this.textBox, invalidOpacity, 1, time, "ease-out");
                this.buttonAnim = this.animator.opacity(this.button, invalidOpacity, 1, time, "ease-out");
                this.historyButtonAnim = this.animator.opacity(this.historyButton, invalidOpacity, 1, time, "ease-out");
            }
        }
        else
        {
            if (opacity > invalidOpacity && this.animator.isAnimation == false)
            {
                this.textBoxAnim = this.animator.opacity(this.textBox, 1, invalidOpacity, time, "ease-out");
                this.buttonAnim = this.animator.opacity(this.button, 1, invalidOpacity, time, "ease-out");
                this.historyButtonAnim = this.animator.opacity(this.historyButton, 1, invalidOpacity, time, "ease-out");
            }
        }

        if (this.isEmpty && this.isHistoryOpened == false && this.history.length > 0)
        {
            this.historyButton.style.display = "inline";
        }
        else
        {
            this.historyButton.style.display = "none";
        }
    }

    updateHistory()
    {
        if (this.isHistoryOpened)
        {
            var text = this.textBox.value;
            if (text != null && text.length > 0)
            {
                globalSystem.uiManager.context.close();
            }
        }
    }

    onKeyDown(event)
    {
        if (event.keyCode === 13 || event.keyCode === 32)
        {
            this.onClick(event);
        }

        if (event.key == "ArrowUp" && this.isFocus)
        {
            this.currentHistoryIndex++;
            this.inputHistory();
        }
        else if (event.key == "ArrowDown" && this.isFocus)
        {
            this.currentHistoryIndex--;
            this.inputHistory();
        }
    }

    onClick(event)
    {
        if (this.checkValid(event) == false)
        {
            return;
        }

        var isValid = false;
        if (this.checkInput(this.textBox.value))
        {
            this.inputValue = this.textBox.value;
            isValid = true;
        }
        this.textBox.value = null;

        if (event != null && StringExtension.isNullOrEmpty(this.inputValue))
        {
            event.stopPropagation();
        }

        globalSystem.uiManager.textLine[this.index].forceScrollBottom();

        if (isValid)
        {
            this.blur();
        }
        else
        {
            //this.focus();
        }
    }

    onFocus(event)
    {
        this.textBox.placeholder = Terminology.get("input_placeholder");
        this.isFocus = true;
        this.historyButton.style.display = "none";
        if (this.isHistryEnabled && this.isHistoryOpened == false)
        {
            if (StringExtension.isNullOrEmpty(this.textBox.value))
            {
                this.openHistory();
            }
        }
    }

    onBlur(event)
    {
        this.textBox.placeholder = StringExtension.empty;
        this.isFocus = false;
        this.currentHistoryIndex = -1;
        this.historyButton.style.display = "inline";
    }

    checkValid(event = null)
    {
        if (this.locked)
        {
            if (event != null)
            {
                event.stopPropagation();
            }
            return false;
        }

        if (globalSystem.uiManager.textLine[this.index].hasQueue)
        {
            return false;
        }

        if (this.index < globalSystem.survivorManager.survivorCount)
        {
            var survivor = globalSystem.survivorManager.survivors[this.index];
            if (survivor != null)
            {
                if (survivor.isCallable == false)
                {
                    return false;
                }
            }
        }

        return true;
    }

    checkInput(input)
    {
        if (input == null)
        {
            return false;
        }

        if (input.length == 0)
        {
            return false;
        }

        if (input.length > TextInput.maxLength)
        {
            return false;
        }

        for (var char of TextInput.invalidChar)
        {
            if (input.indexOf(char) != -1)
            {
                return false;
            }
        }

        for (var text of TextInput.invalidText)
        {
            if (input.startsWith(text))
            {
                return false;
            }
        }

        return true;
    }

    inputHistory()
    {
        if (this.currentHistoryIndex < 0)
        {
            this.currentHistoryIndex = -1;
        }

        if (this.currentHistoryIndex > this.history.length - 1)
        {
            this.currentHistoryIndex = this.history.length - 1;
        }

        if (this.currentHistoryIndex >= 0 && this.currentHistoryIndex < this.history.length)
        {
            var history = this.history[this.currentHistoryIndex];
            this.setInput(history.input);
        }
        else
        {
            this.setInput(StringExtension.empty);
        }
    }

    openHistory()
    {
        var inputs = [];
        for (var i = 0; i < this.history.length; i++)
        {
            const history = this.history[i];
            if (inputs.indexOf(history.input) != -1)
            {
                continue;
            }
            globalSystem.uiManager.context.add(history.word, (event) =>
            {
                this.setInput(history.input);
                event.stopPropagation();
            });
            inputs.push(history.input);
        }

        if (this.history.length > 0)
        {
            globalSystem.uiManager.context.add(Terminology.get("textHistory_off"), (event) =>
            {
                this.isHistryEnabled = false;
            });
        }

        var rect = Element.getRect(this.textBox);
        var x = globalSystem.uiManager.window.getWidthPercentage(rect.x);
        var y = globalSystem.uiManager.window.getHeightPercentage(rect.y);
        var w = 24;  //(rect.width / globalSystem.uiManager.window.windowWidth) * 100;
        var h = globalSystem.uiManager.context.getHeight();
        this.isHistoryOpened = globalSystem.uiManager.context.open(x, y - h, w, () => { this.onHistoryClosed(); });
    }

    onHistoryClosed()
    {
        this.isHistoryOpened = false;
    }

    setInput(value)
    {
        if (Platform.isMobile)
        {
            globalSystem.time.pause();
            var input = prompt("", value);
            globalSystem.time.resume();
            this.inputValue = input;
        }
        else
        {
            this.textBox.value = value;
        }
    }

    getConverted(contains = false)
    {
        if (this.text == null)
        {
            return null;
        }

        var result = globalSystem.inputWordData.convert(this.text, contains);
        return result;
    }

    focus()
    {
        this.textBox.focus();
    }

    blur()
    {
        this.textBox.blur();
    }

    hasFocus()
    {
        var active = document.activeElement;
        var result = (active == this.textBox);
        return result;
    }
}

new TextInput(0);
new TextInput(1);
