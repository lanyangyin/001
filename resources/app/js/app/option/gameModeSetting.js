class GameModeSetting
{
    static currentMode = GameModeSetting.mode.invalid;

    static get mode()
    {
        var result =
        {
            invalid: "mode_invalid",
            normal: "mode_normal",
            story: "mode_story",
        };
        return result;
    }

    static get isInvalid()
    {
        var result = GameModeSetting.isMode(GameModeSetting.mode.invalid);
        return result;
    }

    static get isSkipScenarioCondition()
    {
        var result = GameModeSetting.isMode(GameModeSetting.mode.story);
        return result;
    }

    static setMode(mode)
    {
        GameModeSetting.currentMode = mode;
    }

    static isMode(mode)
    {
        var result = (GameModeSetting.currentMode == mode);
        return result;
    }

    static openSelectDialog(onSelected = null)
    {
        var buttonIndex = 0;
        globalSystem.uiManager.dialog.addButton(buttonIndex++, Terminology.get("mode_normal"), () =>
        {
            globalSystem.uiManager.dialog.close();
            GameModeSetting.setMode(GameModeSetting.mode.normal);
            if (onSelected != null)
            {
                onSelected(GameModeSetting.currentMode);
            }
        });

        globalSystem.uiManager.dialog.addButton(buttonIndex++, Terminology.get("mode_story"), () =>
        {
            globalSystem.uiManager.dialog.close();
            globalSystem.uiManager.dialog.addButton(0, Terminology.get("yes"), () =>
            {
                globalSystem.uiManager.dialog.close();
                GameModeSetting.setMode(GameModeSetting.mode.story);
                if (onSelected != null)
                {
                    onSelected(GameModeSetting.currentMode);
                }
            });
            globalSystem.uiManager.dialog.addButton(1, Terminology.get("no"), () =>
            {
                globalSystem.uiManager.dialog.close();
                GameModeSetting.openSelectDialog(onSelected);
            });
            var text = Terminology.get("mode_storyWarning");
            globalSystem.uiManager.dialog.open(text);
        });

        var text = Terminology.get("mode_selectConfirm");
        if (GameModeSetting.isInvalid)
        {
            text = text.replace("{0}", Terminology.get("mode_changeable"));
        }
        else
        {
            var current = Terminology.get("mode_currentMode");
            current = current.replace("{0}", Terminology.get(GameModeSetting.currentMode));
            text = text.replace("{0}", current);
        }
        globalSystem.uiManager.dialog.open(text);
    }
}
