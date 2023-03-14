class AutoPlayQuest extends AutoPlayFlow
{
    static bunReturn = false;

    static get invalidInputWords()
    {
        var result = ["逃げる"];
        if (AutoPlayQuest.bunReturn)
        {
            result.push("帰る");
        }
        return result;
    }

    static update()
    {
        AutoPlayQuest.setDefRatio();
        AutoPlayQuest.recoverStamina();

        globalSystem.textLineManager.onClick();

        AutoPlayQuest.inputWord();
    }

    static setDefRatio()
    {
        for (var survivor of globalSystem.survivorManager.survivors)
        {
            survivor.defRatio = 10;
        }
    }

    static recoverStamina()
    {
        for (var survivor of globalSystem.survivorManager.survivors)
        {
            survivor.recoverStamina(1);
        }
    }

    static inputWord()
    {
        for (var i = 0; i < globalSystem.uiManager.textLine.length; i++)
        {
            var textline = globalSystem.uiManager.textLine[i];
            var text = null;
            if (Random.range(2) == 0)
            {
                text = AutoPlayQuest.findItemName(i);
            }
            else
            {
                text = AutoPlayQuest.findWord(i, textline);
            }

            if (text == null)
            {
                continue;
            }

            // 無効にしたい入力なら、無視
            var isInvalid = false;
            var invalids = AutoPlayQuest.invalidInputWords;
            for (var invalid of invalids) 
            {
                if (invalid == text)
                {
                    isInvalid = true;
                    break;
                }
            }
            if (isInvalid)
            {
                continue;
            }

            globalSystem.uiManager.textInput[i].textBox.value = text;
            globalSystem.uiManager.textInput[i].onClick(null);
        }
    }

    static findWord(index, textline)
    {
        if (textline.currentState != TextLine.state.waiting && Random.range(50) != 0)
        {
            return null;
        }

        var text = textline.textarea.innerHTML;
        var inputTag = `.onContextMenuButton(event, this);">`;

        // 一定確率で最後の単語は無視する
        //「うん / いや」で毎回「いや」を選んでしまうため。
        var ignoreCount = Random.range(3);
        for (var i = 0; i < ignoreCount; i++)
        {
            var lastIndex = text.lastIndexOf(inputTag);
            if (lastIndex == -1)
            {
                return "word not found.";
            }
            text = text.substr(0, lastIndex);
        }

        var startIndex = text.lastIndexOf(inputTag);
        if (startIndex == -1)
        {
            return "word not found.";
        }
        text = text.substr(startIndex + inputTag.length, text.length - startIndex);

        var endIndex = text.indexOf("</button>");
        if (endIndex == -1)
        {
            return "word not found.";
        }
        text = text.substr(0, endIndex);
        return text;
    }

    static findItemName(index)
    {
        if (Random.range(50) != 0)
        {
            return null;
        }

        if (index >= globalSystem.survivorManager.survivorCount)
        {
            return null;
        }

        var survivor = globalSystem.survivorManager.survivors[index];
        if (survivor == null)
        {
            return null;
        }

        var items = survivor.inventory.list;
        if (items.length == 0)
        {
            return null;
        }

        var itemIndex = Random.range(items.length);
        var item = items[itemIndex];
        if (item == null)
        {
            return null;
        }

        var result = null;
        if (Random.range(2) == 0)
        {
            result = item.name;
        }
        else
        {
            result = ItemExecutor.getName(item);
        }
        return result;
    }
}