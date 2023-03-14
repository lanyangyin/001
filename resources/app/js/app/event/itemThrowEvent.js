class ItemThrowEvent extends Event
{
    constructor(item, preSpeakType)
    {
        super("itemThrow", 0, 1);
        this.item = item;
        this.preSpeakType = preSpeakType;
    }

    setupEvent(survivor, stage)
    {
        if (this.item == null)
        {
            return;
        }

        globalSystem.uiManager.status[survivor.index].storeTemporaryItem(this.item);

        globalSystem.survivorManager.lock(survivor);
        globalSystem.cameraManager.focusSurvivor(survivor);
        if (this.preSpeakType != null)
        {
            survivor.speak(this.preSpeakType, [this.item.name]);
        }
        survivor.speak("itemThrowConfirm", []);
    }

    executeEvent(survivor, stage)
    {
        if (this.item == null)
        {
            return true;
        }

        // 誰かに渡したりして空きができたら、取得可能
        var pushed = survivor.pushItem(this.item);
        if (pushed)
        {
            survivor.speak("itemThrowCancel", [this.item.name]);
            return true;
        }

        globalSystem.uiManager.textLine[survivor.index].setState(TextLine.state.waiting);

        var input = globalSystem.uiManager.textInput[survivor.index].getConverted();
        var text = globalSystem.uiManager.textInput[survivor.index].text;
        if (StringExtension.isNullOrEmpty(input))
        {
            return false;
        }

        globalSystem.uiManager.textInput[survivor.index].reset();
        globalSystem.uiManager.textLine[survivor.index].writeInput(text);

        var item = survivor.getItemByName(input);
        if (input == this.item.name || input == ItemExecutor.getName(this.item))
        {
            this.throw(this.item, survivor);
        }
        else if (item != null)
        {
            this.throw(item, survivor);

            var pushed = survivor.pushItem(this.item);
            if (pushed == false)
            {
                survivor.speak("itemThrowMore", []);
                return false;
            }

            survivor.inventory.pushTemporary(this.item);

            // 武器/防具の場合、現在装備がなければ装備
            if (survivor.weapon == null && this.item.type == "weapon")
            {
                ItemExecutor.execute(this.item, survivor);
            }
            else if (survivor.armor == null && this.item.type == "armor")
            {
                ItemExecutor.execute(this.item, survivor);
            }
        }
        else
        {
            survivor.speak("itemThrowFailed", []);
            return false;
        }

        return true;
    }

    exitEvent(survivor, stage)
    {
        globalSystem.uiManager.status[survivor.index].resetTemporaryItem();

        globalSystem.survivorManager.unlock(survivor);
        globalSystem.cameraManager.focusReset();
    }

    throw(item, survivor)
    {
        if (item == null)
        {
            return;
        }

        switch (item.type)
        {
            case "heal":
            case "cooking":
            case "food":
                {
                    ItemUseEvent.useItem(survivor, item);
                    if (this.item != item)
                    {
                        survivor.speak("itemThrowCancel", [this.item.name]);
                    }
                }
                break;
            default:
                {
                    survivor.speak(this.type, [item.name]);
                    if (this.item != item)
                    {
                        survivor.removeItem(item);
                    }
                }
                break;
        }
    }
}