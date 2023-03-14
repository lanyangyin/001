class CatalogWindow extends UIElement
{
    constructor()
    {
        super("catalog");
        this.window = null;
        this.title = null;
        this.page = null;
        this.prevButton = null;
        this.nextButton = null;
        this.closeButton = null;
        this.animator = new Animator();
        this.windowAnim = null;
        this.elements = [];
        this.list = [];
        this.onSelect = null;
        this.currentPage = 0;
    }

    static get elementCount()
    {
        return 8;
    }

    get pageCount()
    {
        var result = parseInt((this.list.length - 1) / CatalogWindow.elementCount) + 1;
        return result;
    }

    setup()
    {
        this.window = document.getElementById("catalog");
        this.title = document.getElementById("catalogTitle");
        this.page = document.getElementById("catalogPage");
        this.prevButton = document.getElementById("catalogPagePrev");
        this.prevButton.onclick = () =>
        {
            this.currentPage--;
            if (this.currentPage < 0)
            {
                this.currentPage = this.pageCount - 1;
            }
            this.setupElements();
        };
        this.nextButton = document.getElementById("catalogPageNext");
        this.nextButton.onclick = () =>
        {
            this.currentPage++;
            if (this.currentPage > this.pageCount - 1)
            {
                this.currentPage = 0;
            }
            this.setupElements();
        };
        this.closeButton = document.getElementById("catalogClose");
        this.closeButton.onclick = () =>
        {
            this.close();
        };
        for (var i = 0; i < CatalogWindow.elementCount; i++)
        {
            var element = document.getElementById(`catalogElement${i}`);
            this.elements.push(element);
        }
    }

    update()
    {
        this.animator.update();
    }

    enable()
    {
        this.openButton.style.display = "inline";
    }

    disable()
    {
        this.openButton.style.display = "none";
    }

    open(title, list, onSelect)
    {
        if (this.windowAnim != null)
        {
            return;
        }

        var onEnd = () =>
        {
            this.windowAnim = null;
        };

        this.list = list;
        this.onSelect = onSelect;
        this.currentPage = 0;
        this.setupElements();
        this.window.style.display = "inline";
        this.title.innerHTML = title;
        this.windowAnim = this.animator.opacity(this.window, 0, 1, 0.5, "ease-out", onEnd);
    }

    close()
    {
        if (this.windowAnim != null)
        {
            return;
        }

        var onEnd = () =>
        {
            this.window.style.display = "none";
            this.windowAnim = null;
        };
        this.windowAnim = this.animator.opacity(this.window, 1, 0, 0.5, "ease-out", onEnd);
    }

    setupElements()
    {
        for (var i = 0; i < CatalogWindow.elementCount; i++)
        {
            const element = this.elements[i];
            const index = CatalogWindow.elementCount * this.currentPage + i;
            if (index >= this.list.length)
            {
                element.style.display = "none";
                continue;
            }

            element.style.display = "inline";
            element.innerHTML = this.list[index];
            element.onclick = () =>
            {
                if (this.onSelect == null)
                {
                    return;
                }
                this.onSelect(index);
            };
        }

        this.page.innerHTML = `${this.currentPage + 1} / ${this.pageCount}`;
    }
}

new CatalogWindow();
