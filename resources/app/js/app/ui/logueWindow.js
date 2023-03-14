class LogueWindow extends UIElement
{
    constructor()
    {
        super("logue");
        this.autoButton = null;
    }

    setup()
    {
        this.window = document.getElementById("logue");
        this.autoButton = document.getElementById("logueTextAuto");

        globalSystem.textAutoManager.registerButton(this.autoButton);
    }

    setOnClickEvent(event)
    {
        this.window.onclick = event;
    }
}

new LogueWindow();
