class ContextMenuWindow extends UIElement
{
    constructor()
    {
        super("context");

        this.window = null;
        this.frame = null;
        this.elements = [];
        this.animator = new Animator();
        this.opacityAnim = null;
        this.heightAnim = null;
        this.frameWidth = 0;
        this.frameHeight = 0;
        this.isOpen = false;
        this.onClosed = null;
        this.buttons = [];
    }

    static get buttonHeight()
    {
        return 5;
    }

    setup()
    {
        this.window = document.getElementById("contextMenu");
        this.frame = document.getElementById("contextMenuFrame");

        this.window.onclick = function (owner)
        {
            return function ()
            {
                if (owner.isOpen)
                {
                    owner.close();
                }
            };
        }(this);

        this.window.onwheel = (event) =>
        {
            event.stopPropagation();
        };

        document.body.addEventListener('keydown', (event) =>
        {
            if (event.key != 'Enter')
            {
                return;
            }
            if (this.isOpen)
            {
                this.close();
            }
        });
    }

    update()
    {
        this.animator.update();
    }

    getHeight()
    {
        var count = 0;
        if (this.buttons.length > 0)
        {
            count = this.buttons.length;
        }
        else
        {
            count = this.elements.length;
        }

        var result = (count + 2) * ContextMenuWindow.buttonHeight;
        return result;
    }

    add(text, onClick = null, color = null)
    {
        var data = { text: text, onClick: onClick, color: color };
        this.buttons.push(data);
    }

    open(x, y, w = 10, onClosed = null)
    {
        if (this.opacityAnim != null)
        {
            this.animator.cancel(this.opacityAnim, true);
            this.opacityAnim = null;
        }

        this.setupElements();

        if (this.elements.length == 0)
        {
            return false;
        }

        this.frameWidth = w;
        this.frameHeight = this.getHeight();

        var leftLimit = (100 - this.frameWidth);
        if (x > leftLimit)
        {
            x = leftLimit;
        }

        var topLimit = (100 - this.frameHeight);
        if (y > topLimit)
        {
            y = topLimit;
        }

        var elementHeight = 80 / (this.elements.length + 2);
        for (var element of this.elements)
        {
            element.style.height = `${elementHeight}%`;
        }
        this.elements[0].style.marginTop = `${elementHeight / 2}%`;

        this.frame.style.left = `${x}%`;
        this.frame.style.top = `${y}%`;
        this.frame.style.width = `${this.frameWidth}%`;
        this.frame.style.height = `${this.frameHeight}%`;

        var onEnd = () =>
        {
            this.isOpen = true;
            this.opacityAnim = null;
        };

        this.onClosed = onClosed;
        this.window.style.display = "inline";
        this.opacityAnim = this.animator.opacity(this.window, 0, 1, 0.3, "ease-out", onEnd);
        this.heightAnim = this.animator.transform(this.frame, { x: 0, y: 0 }, { x: 0, y: 0 }, 0, 0, { x: 1, y: 0 }, { x: 1, y: 1 }, 0.2, "ease-out");
        return true;
    }

    close()
    {
        if (this.opacityAnim != null)
        {
            this.animator.cancel(this.opacityAnim, true);
            this.opacityAnim = null;
        }

        var onEnd = () =>
        {
            this.window.style.display = "none";
            this.opacityAnim = null;
            if (this.onClosed != null)
            {
                this.onClosed();
                this.onClosed = null;
            }
        };
        this.isOpen = false;
        this.elements = [];
        this.frame.innerHTML = "";
        this.opacityAnim = this.animator.opacity(this.window, 1, 0, 0.3, "ease-out", onEnd);
    }

    setupElements()
    {
        this.elements = [];
        this.frame.innerHTML = "";
        for (var button of this.buttons)
        {
            var element = this.createButton(button.text, button.onClick, button.color);
            this.elements.push(element);
        }
        this.buttons = [];
    }

    createButton(text, onClick = null, color = null)
    {
        var button = document.createElement("button");
        button.className = "app contextMenuElement";

        button.innerHTML = Tag.replace(text);
        button.onclick = (event) =>
        {
            this.close();
            if (onClick != null)
            {
                onClick(event);
            }
        };

        if (onClick == null)
        {
            button.style.border = "none";
        }
        else
        {
            button.style.border = "inline";
        }

        if (color != null)
        {
            button.style.color = color;
        }

        this.frame.appendChild(button);
        return button;
    }
}

new ContextMenuWindow();
