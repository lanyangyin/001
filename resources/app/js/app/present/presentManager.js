class PresentManager extends GlobalManager
{
    constructor()
    {
        super("presentManager");
        this.finishedIds = [];
        this.finishedDate = [];
    }

    check(timing)
    {
        var list = globalSystem.presentData.getDatasByTiming(timing);
        if (list.length == 0)
        {
            return false;
        }

        var validList = [];
        var groupList = [];
        for (var data of list)
        {
            if (StringExtension.isValid(data.group))
            {
                var isAlready = false;
                for (var already of groupList)
                {
                    if (already.group == data.group)
                    {
                        already.list.push(data);
                        isAlready = true;
                        break;
                    }
                }
                if (isAlready == false)
                {
                    group = { group: data.group, list: [data] };
                    groupList.push(group);
                }
                continue;
            }
            validList.push(data);
        }
        for (var group of groupList)
        {
            var index = Random.range(group.list.length);
            var data = group.list[index];
            validList.push(data);
        }

        var present = null;
        for (var data of validList)
        {
            var isFinished = this.isFinished(data);
            if (isFinished)
            {
                continue;
            }

            present = data;
            break;
        }

        if (present == null)
        {
            return false;
        }

        this.give(present, timing);
        return true;
    }

    give(data, timing)
    {
        var item = globalSystem.itemData.getDataById(data.item);
        if (item == null)
        {
            return;
        }

        globalSystem.uiManager.dialog.addButton(0, data.button, () =>
        {
            globalSystem.uiManager.dialog.close();
            globalSystem.houseManager.pushItem(item, false);
            this.finish(data);
            this.check(timing);
        });
        var message = data.message;
        message = message.replace("{0}", ItemExecutor.getName(item));
        globalSystem.uiManager.dialog.open(message);
    }

    finish(data)
    {
        if (this.finishedIds.indexOf(data.id) == -1)
        {
            this.finishedIds.push(data.id);
        }

        var already = false;
        for (var finished of this.finishedDate)
        {
            if (finished.id == data.id)
            {
                finished.date = new Date();
                already = true;
                break;
            }
        }
        if (already == false)
        {
            var date = { id: data.id, date: new Date() };
            this.finishedDate.push(date);
        }

        SaveSystem.save();
    }

    isFinished(data)
    {
        switch (data.continueType)
        {
            case "dailyGroup":
                {
                    var date = this.getGroupFinishedDate(data.group);
                    if (date != null)
                    {
                        var nextDate = new Date(date);
                        var now = new Date();
                        if (now.getFullYear() == nextDate.getFullYear() && now.getMonth() == nextDate.getMonth() && now.getDay() == nextDate.getDay())
                        {
                            return true;
                        }
                    }
                }
                break;
            default:
                {
                    if (this.finishedIds.indexOf(data.id) != -1)
                    {
                        return true;
                    }
                }
                break;
        }

        return false;
    }

    getFinishedDate(id)
    {
        for (var data of this.finishedDate)
        {
            if (data == null)
            {
                continue;
            }
            if (data.id == id)
            {
                var result = new Date(data.date);
                return result;
            }
        }
        return null;
    }

    getGroupFinishedDate(group)
    {
        var result = null;
        for (var finished of this.finishedDate)
        {
            if (finished == null)
            {
                continue;
            }
            var data = globalSystem.presentData.getDataById(finished.id);
            if (data == null)
            {
                continue;
            }
            if (data.group == group)
            {
                var finishedDate = new Date(finished.date);
                if (result == null || finishedDate > result)
                {
                    result = finishedDate;
                }
            }
        }
        return result;
    }
}

new PresentManager();
