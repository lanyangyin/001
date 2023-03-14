class AutoPlayExproler extends AutoPlayFlow
{
    static update()
    {
        if (globalSystem.flowManager.nextFlow != null)
        {
            return;
        }

        AutoPlayExproler.pushItems();
        AutoPlayExproler.requestQuest();
    }

    static pushItems()
    {
        var index = 0;
        for (var survivor of globalSystem.survivorManager.survivors)
        {
            var count = survivor.inventory.list.length;
            for (var i = count - 1; i >= 0; i--)
            {
                if (i == 0 || Random.range(3) == 0)
                {
                    var item = survivor.inventory.list[i];
                    globalSystem.uiManager.itemBoxs[index].pushItem(item);
                }
            }
            index++;
        }
    }

    static requestQuest()
    {
        globalSystem.uiManager.exproler.setupLayout();

        // 日付
        var dates = globalSystem.uiManager.exproler.list;
        var dateCount = dates.childElementCount;
        var dateIndex = Random.range(dateCount);
        var date = dates.children[dateIndex];
        if (date.children[1].onclick != null)
        {
            date.children[1].onclick();
        }

        // クエスト
        var quests = globalSystem.uiManager.exproler.list;
        var questCount = quests.childElementCount;
        var questIndex = Random.range(questCount);
        var quest = quests.children[questIndex];
        if (quest.children[1].onclick != null)
        {
            quest.children[1].onclick();
        }

        // ファイル
        var files = globalSystem.uiManager.exproler.list;
        var file = files.children[0];
        if (file.children[1].onclick != null)
        {
            file.children[1].onclick();
        }
    }
}
