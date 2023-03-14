class HouseFlow extends Flow
{
    constructor()
    {
        super("house", false);
    }

    setupFlow()
    {
        globalSystem.uiManager.background.setImage("bag00");
        globalSystem.cameraManager.request("enter00");
        globalSystem.cameraManager.request("enter01");
        globalSystem.cameraManager.enableRandomMove();

        globalSystem.uiManager.menuTab.enable();

        var recycled = globalSystem.houseManager.recycle();
        if (recycled != null)
        {
            globalSystem.uiManager.dialog.open(Terminology.get("house_recycle").replace("{0}", recycled.name));
        }

        for (var box of globalSystem.uiManager.itemBoxs)
        {
            box.updateItems();
        }
        globalSystem.uiManager.house.updateItems();
        globalSystem.uiManager.craft.updateItems();
    }

    updateFlow()
    {
    }

    exitFlow()
    {
        globalSystem.houseManager.updateOpenedItem();
        globalSystem.cameraManager.disableRandomMove();

        globalSystem.uiManager.menuTab.disable();
    }
}