class AutoPlayResident extends AutoPlayFlow
{
    static update()
    {
        var dialog = globalSystem.uiManager.dialog;
        var isDialogOpend = (dialog.window.style.display == "inline");
        var isDialogAnimation = (dialog.windowAnim != null);
        if (isDialogOpend/* && isDialogAnimation == false*/)
        {
            var button = dialog.buttons[0];
            if (button != null)
            {
                dialog.buttons[0].onclick();
                return true;
            }
        }

        return false;
    }
}
