class TextInputManager extends GlobalManager
{
    constructor()
    {
        super("textInputManager");
        this.inputs = [];
        this.focused = null;
    }

    setup()
    {
        document.body.addEventListener('keydown', (event) =>
        {
            this.onClick(event);
        });
    }

    update()
    {
        /* nop */
    }

    register(textInput)
    {
        this.inputs.push(textInput);
    }

    lock()
    {
        for (var input of this.inputs)
        {
            input.lock();
        }
    }

    unlock()
    {
        for (var input of this.inputs)
        {
            input.unlock();
        }
    }

    onClick(event)
    {
        if (event.key == "Enter")
        {
            return;
        }

        if (event.key == "Tab")
        {
            this.onInputTab(event);
        }
        /*
        else if (event.key.match(/^[A-Za-z0-9]*$/))
        {
            this.onInputText(event);
        }
        */
    }

    onInputTab(event)
    {
        for (var input of this.inputs)
        {
            if (this.focused == input)
            {
                continue;
            }
            input.focus();
            this.focused = input;
            break;
        }

        event.preventDefault();
        event.stopPropagation();
    }

    onInputText(event)
    {
        if (this.focused != null)
        {
            this.focused.focus();
            return;
        }

        for (var input of this.inputs)
        {
            input.focus();
            this.focused = input;
            break;
        }
    }

    isEmpty()
    {
        for (var input of this.inputs)
        {
            if (input.isEmpty == false)
            {
                return false;
            }
        }
        return true;
    }

    disableHistory()
    {
        for (var input of this.inputs)
        {
            input.isHistryEnabled = false;
        }
    }

    hasFocus()
    {
        for (var input of this.inputs)
        {
            if (input.hasFocus())
            {
                return true;
            }
        }
        return false;
    }
}

new TextInputManager();