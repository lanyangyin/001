class GameOverFlow extends Flow
{
    constructor()
    {
        super("gameOver", true);
    }

    setupFlow()
    {
        //globalSystem.soundManager.playSe("gameover00");
        globalSystem.uiManager.gameOver.playAnimation();
        this.lostItems();
    }

    updateFlow()
    {
    }

    exitFlow()
    {
        globalSystem.soundManager.pauseBgm();
        globalSystem.soundManager.pauseSe();
    }

    lostItems()
    {
        // 今回の探索で手に入ったアイテムをロスト（収納棚含めて）
        var survivors = globalSystem.survivorManager.survivors;
        for (var survivor of survivors)
        {
            survivor.inventory.lostTemporary();
        }

        // 全アイテムロスト
        for (var survivor of globalSystem.survivorManager.survivors)
        {
            var weapon = survivor.weapon;
            var armor = survivor.armor;
            survivor.lostAllItems();

            // 装備品だけは保持
            if (weapon != null && survivor.hasItem(weapon) == false)
            {
                survivor.pushItem(weapon);
                survivor.equipWeapon(weapon);
            }
            if (armor != null && survivor.hasItem(armor) == false)
            {
                survivor.pushItem(armor);
                survivor.equipArmor(armor);
            }
        }
    }
}