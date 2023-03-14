class ShortCutKey
{
    constructor()
    {
        /* nop */
    }

    static setup()
    {
        document.body.addEventListener('keydown', (event) => { ShortCutKey.onKeyDown(event); });
    }

    static onKeyDown(event)
    {
        if (globalSystem.textInputManager.hasFocus())
        {
            return;
        }

        /* 誤操作が多いため廃止
        if (event.key == "a")
        {
            globalSystem.textAutoManager.switchAuto();
        }
        */
    }
}