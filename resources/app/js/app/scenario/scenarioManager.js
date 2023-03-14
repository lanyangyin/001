class ScenarioManager extends GlobalManager
{
    constructor()
    {
        super("scenarioManager");
        this.openDate = [];
        this.finishDate = [];
        this.finishId = [];
        this.finishSubId = [];
        this.temporaryScenarioId = null;
        this.executeQueue = [];

        this.skipCondition = false;
    }

    static get scenarioType()
    {
        if (TestSwitch.enabled)
        {
            var result =
            {
                main: "main-second",
                sub: "sub",
                repeat: "repeat",
                character: "character-second",
            };
            return result;
        }

        var result =
        {
            main: "main",
            sub: "sub",
            repeat: "repeat",
            character: "character",
        };
        return result;
    }

    get startDate()
    {
        if (TestSwitch.enabled)
        {
            return 5;
        }

        return 0;
    }

    reset()
    {
        this.executeQueue = [];
    }

    getLastScenario(date = null)
    {
        if (this.finishId.length == 0)
        {
            return null;
        }

        if (this.temporaryScenarioId != null)
        {
            var result = globalSystem.scenarioData.getDataById(this.temporaryScenarioId);
            if (result != null && result.date == date)
            {
                return result;
            }
        }

        var result = null;
        if (date == null)
        {
            // 日付指定がないなら、最後のシナリオを取得
            var last = this.finishId[this.finishId.length - 1];
            result = globalSystem.scenarioData.getDataById(last);
        }
        else
        {
            var count = this.finishId.length;
            for (var i = count - 1; i >= 0; i--)
            {
                var id = this.finishId[i];
                var scenario = globalSystem.scenarioData.getDataById(id);
                if (scenario == null)
                {
                    continue;
                }
                if (scenario.date != date && scenario.openDate != date)
                {
                    continue;
                }
                result = scenario;
                break;
            }
        }

        return result;
    }

    checkLastScenarioCondition(date = null)
    {
        if (this.skipCondition)
        {
            return true;
        }

        if (GameModeSetting.isSkipScenarioCondition)
        {
            return true;
        }

        if (this.finishId.length == 0)
        {
            return true;
        }

        var last = this.getLastScenario(date);
        if (last == null)
        {
            return true;
        }

        var result = ScenarioExecutor.checkCondition(last);
        return result;
    }

    getNextScenario(date, selectDateOnly = false, scenarioType = null)
    {
        var list = [];
        var conditionIngoreList = [];

        // 条件を満たしていなければ、再生できない
        if (this.checkLastScenarioCondition(date))
        {
            // 指定日付のシナリオ
            list = list.concat(this.getNexts(date, false, scenarioType));
            conditionIngoreList = conditionIngoreList.concat(this.getNexts(date, true, scenarioType));

            // 日付未指定のシナリオも含める
            if (selectDateOnly == false)
            {
                // 日付未指定分のシナリオ
                list = list.concat(this.getNexts(-1, false, scenarioType));
                conditionIngoreList = conditionIngoreList.concat(this.getNexts(-1, true, scenarioType));
            }
        }

        // サブイベントから抽選
        if (list.length == 0)
        {
            list = list.concat(this.getNextSubs(date));
            conditionIngoreList = conditionIngoreList.concat(this.getNextSubs(date, true));

            // 日付未指定のシナリオも含める
            if (selectDateOnly == false)
            {
                // 日付未指定分のシナリオ
                list = list.concat(this.getNextSubs(-1));
                conditionIngoreList = conditionIngoreList.concat(this.getNextSubs(-1, true));
            }
        }

        // 発生可能シナリオがないならnullを返す
        if (list.length == 0)
        {
            return null;
        }

        // 最小のプライオリティを求める
        var minPriority = Number(conditionIngoreList[0].priority);
        for (var data of conditionIngoreList)
        {
            var priority = Number(data.priority);
            if (priority < minPriority)
            {
                minPriority = priority;
            }
        }

        // 発生可能シナリオの中から抽選
        list = Random.shuffle(list);
        for (var data of list)
        {
            if (Number(data.priority) == minPriority)
            {
                return data;
            }
        }
        return null;
    }

    getRepeatScenario(date, selectDateOnly = false)
    {
        var list = this.getNextRepeats(date);

        if (selectDateOnly == false)
        {
            var noDateList = this.getNextRepeats(-1);
            list = list.concat(noDateList);
        }

        if (list.length == 0)
        {
            return null;
        }

        list = Random.shuffle(list);
        list.sort((a, b) =>
        {
            return Number(a.priority) - Number(b.priority);
        });
        var data = list[0];

        return data;
    }

    getNexts(date, conditionIngore = false, scenarioType = null)
    {
        var types = [ScenarioManager.scenarioType.main, ScenarioManager.scenarioType.character];
        if (scenarioType != null)
        {
            types = [scenarioType];
        }
        var finished = this.getFinishedIds();
        var result = globalSystem.scenarioData.getNexts(finished, types, date, conditionIngore);
        return result;
    }

    getNextSubs(date, conditionIngore = false)
    {
        var finished = this.getFinishedIds();
        var result = globalSystem.scenarioData.getNexts(finished, [ScenarioManager.scenarioType.sub], date, conditionIngore);
        return result;
    }

    getNextRepeats(date, conditionIngore = false)
    {
        var finished = this.getFinishedIds();
        var result = globalSystem.scenarioData.getNexts(finished, [ScenarioManager.scenarioType.repeat], date, conditionIngore);
        return result;
    }

    isFinished(id)
    {
        var finished = this.getFinishedIds();
        var result = (finished.indexOf(id) != -1);
        return result;
    }

    getFinishedIds()
    {
        var result = [];
        result = result.concat(this.finishId);
        result = result.concat(this.finishSubId);
        return result;
    }

    finish(data)
    {
        if (data == null)
        {
            return;
        }

        // 新しいシナリオフォルダ開放
        var open = String(data.openDate);
        if (StringExtension.isValid(open))
        {
            this.openDateId(open);
        }

        // 終了シナリオフォルダを登録
        var finish = String(data.finishDate);
        if (StringExtension.isValid(finish) && this.finishDate.indexOf(finish) == -1)
        {
            this.finishDate.push(finish);
        }

        switch (data.scenarioType)
        {
            case ScenarioManager.scenarioType.main:
            case ScenarioManager.scenarioType.character:
                {
                    // 終了済みシナリオに登録
                    if (this.finishId.indexOf(data.id) == -1)
                    {
                        this.finishId.push(data.id);
                    }
                    this.resetStoryScenario();
                }
                break;
            case ScenarioManager.scenarioType.sub:
                {
                    // 終了済みシナリオに登録
                    if (this.finishSubId.indexOf(data.id) == -1)
                    {
                        this.finishSubId.push(data.id);
                    }
                }
                break;
            default:
                break;
        }

        this.skipCondition = false;
    }

    openDateId(date)
    {
        var open = String(date);
        if (StringExtension.isValid(open) && this.openDate.indexOf(open) == -1)
        {
            this.openDate.push(open);
        }
    }

    isOpend(date)
    {
        var id = String(date);
        var result = (this.openDate.indexOf(id) != -1 && this.finishDate.indexOf(id) == -1);
        return result;
    }

    isClosed(date)
    {
        var id = String(date);
        var result = (this.finishDate.indexOf(id) != -1);
        return result;
    }

    isFinishedDate(date)
    {
        var result = (this.finishDate.indexOf(date) != -1);
        return result;
    }

    setStoryScenario(id)
    {
        this.temporaryScenarioId = id;
    }

    resetStoryScenario()
    {
        this.temporaryScenarioId = null;
    }

    enqueue(scenario)
    {
        this.executeQueue.push(scenario);
    }

    dequeue()
    {
        if (this.executeQueue.length == 0)
        {
            return null;
        }

        var result = this.executeQueue.shift();
        return result;
    }
}

new ScenarioManager();
