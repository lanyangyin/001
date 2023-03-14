class DialogWindow extends UIElement
{
    constructor()
    {
        super("dialog");

        this.window = null;
        this.text = null;
        this.bottomText = null;
        this.selector = null;
        this.selectorText = null;
        this.selectorPage = null;
        this.buttons = [];

        this.selections = [];
        this.selectionsText = [];
        this.selectIndex = 0;
        this.brCount = 0;
        this.animator = new Animator();
    }

    get buttonCount()
    {
        return 5;
    }

    setup()
    {
        this.window = document.getElementById("dialog");
        this.text = document.getElementById("dialogText0");
        this.bottomText = document.getElementById("dialogText1");
        this.selector = document.getElementById("selector");
        this.selectorText = document.getElementById("selectorText");
        this.selectorPage = document.getElementById("selectorPage");
        for (var i = 0; i < this.buttonCount; i++)
        {
            var e = document.getElementById(`dialogButton${i}`);
            this.buttons.push(e);
            e.style.display = "none";
        }

        var left = document.getElementById("selectorLeft");
        var right = document.getElementById("selectorRight");
        left.onclick = () =>
        {
            this.moveSelector(-1);
        };
        right.onclick = () =>
        {
            this.moveSelector(1);
        };

        this.window.style.opacity = 0;
    }

    update()
    {
        this.animator.update();
    }

    addButton(index, text, onClick = null, onMouseOver = null)
    {
        if (index >= this.buttonCount)
        {
            return;
        }

        this.buttons[index].innerHTML = text;
        this.buttons[index].onclick = onClick;
        this.buttons[index].onmouseover = onMouseOver;
        this.buttons[index].style.display = "inline";

        if (onClick == null)
        {
            this.buttons[index].style.border = "none";
        }
        else
        {
            this.buttons[index].style.border = "inline";
        }
    }

    open(text)
    {
        if (this.windowAnim != null)
        {
            this.animator.cancel(this.windowAnim, true);
        }

        var onEnd = () =>
        {
            this.windowAnim = null;
        };

        this.text.innerHTML = Tag.replace(text);
        this.bottomText.innerHTML = null;

        // ボタンが1つもないなら、「とじる」ボタンをつける
        if (this.buttons[0].style.display == "none")
        {
            this.addCloseButton(0);
        }

        var opacity = parseFloat(this.window.style.opacity);
        this.window.style.display = "inline";
        this.windowAnim = this.animator.opacity(this.window, opacity, 1, 0.3, "ease-out", onEnd);
    }

    addCloseButton(index)
    {
        const dialog = this;
        this.addButton(index, Terminology.get("dialog_close"), () =>
        {
            dialog.close();
        });
    }

    openSelector(text, names, descriptions)
    {
        this.open(text);

        this.selections = names;
        this.selectionsText = descriptions;
        this.selectIndex = 0;
        this.selectorText.style.display = "block";
        this.selector.style.display = "block";
        this.brCount = 0;
        for (var description of descriptions)
        {
            var count = (description.match(/<br>/g) || []).length;
            if (count > this.brCount)
            {
                this.brCount = count;
            }
        }
        this.updateSelector();
    }

    updateSelector()
    {
        if (this.selectIndex < 0)
        {
            this.selectIndex = this.selections.length - 1;
        }
        else if (this.selectIndex >= this.selections.length)
        {
            this.selectIndex = 0;
        }
        this.selectorText.innerHTML = this.selections[this.selectIndex];
        var text = this.selectionsText[this.selectIndex];
        var brCount = (text.match(/<br>/g) || []).length;
        if (brCount < this.brCount)
        {
            var count = this.brCount - brCount;
            for (var i = 0; i < count; i++)
            {
                text += "<br>";
            }
        }
        this.bottomText.innerHTML = text;
        this.selectorPage.innerHTML = `${this.selectIndex + 1} / ${this.selections.length}`;
    }

    moveSelector(value)
    {
        this.selectIndex += value;
        this.updateSelector();
    }

    close()
    {
        if (this.windowAnim != null)
        {
            this.animator.cancel(this.windowAnim, true);
        }

        var onEnd = () =>
        {
            this.window.style.display = "none";
            this.selectorText.style.display = "none";
            this.selector.style.display = "none";
            this.windowAnim = null;
        };

        var opacity = parseFloat(this.window.style.opacity);
        this.windowAnim = this.animator.opacity(this.window, opacity, 0, 0.3, "ease-out", onEnd);

        for (var button of this.buttons)
        {
            button.style.display = "none";
        }
    }
}

new DialogWindow();
