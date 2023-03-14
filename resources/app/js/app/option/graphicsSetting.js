class GraphicsSetting
{
    static get fontSize()
    {
        var result =
            [
                55,
                64,
                72,
            ];
        return result;
    }

    static isAnimationCut = false;

    static fontSizeIndex = 0;

    static switchAnimationCut()
    {
        GraphicsSetting.animationCut(!GraphicsSetting.isAnimationCut);
    }

    static animationCut(flag)
    {
        GraphicsSetting.isAnimationCut = flag;
        if (flag)
        {
            globalSystem.lightManager.disable();
            globalSystem.cameraManager.enableAnimationCut();
        }
        else
        {
            globalSystem.lightManager.enable();
            globalSystem.cameraManager.disableAnimationCut();
        }
    }

    static switchFontSize()
    {
        var nextIndex = GraphicsSetting.fontSizeIndex + 1;
        GraphicsSetting.setFontSize(nextIndex);
    }

    static setFontSize(index)
    {
        if (index >= GraphicsSetting.fontSize.length)
        {
            index = 0;
        }
        GraphicsSetting.fontSizeIndex = index;
        var size = GraphicsSetting.fontSize[index];
        globalSystem.uiManager.window.rootSelecter.style.setProperty('--sentence-font-size', `${size}%`);
    }
}
