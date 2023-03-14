class QuestManager extends GlobalManager
{
    constructor()
    {
        super("questManager");
        this.currentQuest = null;
        this.currentScenario = null;
        this.questSucceed = false;
        this.questFailed = false;
        this.scenarioExecuted = false;
        this.finishedQuest = [];
        this.playedQuestCount = 0;
        this.playedQuestProgressMax = 0;
        this.playedQuestTimes = 0;
        this.visitedLocations = [];
        this.usedDescribe = [];
        this.questSuccessTimer = 0;
        this.questFailedTimer = 0;
        this.questFailedFlow = null;
        this.startLocation = null;
        this.temporaryVariables = {};
        this.isReplay = false;
    }

    static get finishedDataCountMax()
    {
        return 30;
    }

    get questEnd()
    {
        var result = this.questSucceed || this.questFailed;
        return result;
    }

    setupQuest(data, scenario, area = null, location = null, isReplay = false)
    {
        if (data == null)
        {
            return;
        }

        this.currentQuest = data;
        this.currentScenario = scenario;
        this.isReplay = isReplay;
        this.questSucceed = false;
        this.questFailed = false;
        this.scenarioExecuted = false;
        this.usedDescribe = [];
        this.questSuccessTimer = 0;
        this.questFailedTimer = 0;
        this.questFailedFlow = new GameOverFlow();
        QuestExecutor.setup(data, scenario, area, location);

        if (location != null)
        {
            this.startLocation = location;
        }
    }

    updateQuest()
    {
        if (this.currentQuest != null)
        {
            if (this.questFailed == false && QuestExecutor.checkFailed(this.currentQuest))
            {
                this.questFailedTimer += globalSystem.time.deltaTime;
                if (this.questFailedTimer > 3)
                {
                    this.failed();
                }
                for (var survivor of globalSystem.survivorManager.survivors)
                {
                    survivor.resetEvents();
                }
            }
            else if (this.questSucceed == false && QuestExecutor.checkSuccess(this.currentQuest))
            {
                this.questSuccessTimer += globalSystem.time.deltaTime;
                if (this.questSuccessTimer > 3)
                {
                    var speak = Type.toBoolean(this.currentQuest.successSpeak);
                    this.success(speak);
                }
            }
        }
    }

    success(speak = true)
    {
        this.onSuccess(speak);
        this.questSucceed = true;
    }

    failed(speak = true)
    {
        this.onFailed(speak);
        this.questFailed = true;
    }

    onSuccess(speak)
    {
        if (this.currentScenario != null && this.scenarioExecuted)
        {
            speak = (this.currentScenario.questEndSpeak === (true).toString());
        }
        QuestExecutor.success(speak);
    }

    onFailed(speak)
    {
        QuestExecutor.failed(speak);
    }

    endQuest(complete)
    {
        // 終了済みクエストに追加
        if (this.currentQuest.date != -1)
        {
            var finished = {};
            finished.date = this.currentQuest.date;
            finished.location = this.startLocation;
            finished.result = complete;
            finished.progress = globalSystem.areaManager.getIndex() + 1;
            this.finishedQuest.unshift(finished);
            if (this.finishedQuest.length > QuestManager.finishedDataCountMax)
            {
                this.finishedQuest.length = QuestManager.finishedDataCountMax;
            }
        }

        // クエスト再生回数加算
        if (complete)
        {
            globalSystem.areaManager.applyOpenedLocations();

            if (this.currentScenario == null)
            {
                var advance = globalSystem.areaManager.getIndex() + 1;

                var count = Number(this.playedQuestCount);
                this.playedQuestCount = count + advance;

                var times = Number(this.playedQuestTimes);
                this.playedQuestTimes = times + 1;

                var max = Number(this.playedQuestProgressMax);
                if (max < advance)
                {
                    this.playedQuestProgressMax = advance;
                }

                var date = this.currentQuest.date;
                var already = false;
                var locations = globalSystem.areaManager.getVisitedLocationsId();
                for (var visited of this.visitedLocations)
                {
                    if (visited.date != date)
                    {
                        continue;
                    }
                    for (var location of locations)
                    {
                        if (visited.locations.indexOf(location) != -1)
                        {
                            continue;
                        }
                        visited.locations.push(location);
                    }
                    already = true;
                    break;
                }
                if (already == false)
                {
                    var visited = { date: date, locations: locations };
                    this.visitedLocations.push(visited);
                }
            }
        }

        globalSystem.survivorManager.onQuestEnd(complete);
        globalSystem.locationManager.reset();

        if (EndlessSystem.isEndless(this.currentQuest))
        {
            globalSystem.endlessManager.onQuestEnd(complete);
        }

        // リセット
        this.currentQuest = null;
        this.currentScenario = null;
        this.temporaryVariables = {};
    }

    setQuestTimes(value)
    {
        this.playedQuestTimes = value;
    }

    setQuestFailedFlow(flow)
    {
        this.questFailedFlow = flow;
    }

    getFinishedData(date, location)
    {
        var result = [];
        for (var data of this.finishedQuest)
        {
            if (data.date != date)
            {
                continue;
            }
            if (data.location != location)
            {
                continue;
            }
            result.push(data);
        }
        return result;
    }

    clearQuestCount()
    {
        this.playedQuestCount = 0;
        this.playedQuestProgressMax = 0;
        this.playedQuestTimes = 0;
    }

    clearVisitedLocaton(date)
    {
        for (var i = this.visitedLocations.length - 1; i >= 0; i--)
        {
            if (this.visitedLocations[i].date != date)
            {
                continue;
            }
            this.visitedLocations = List.remove(this.visitedLocations, this.visitedLocations[i]);
        }
    }

    isVisitedLocaton(date, location)
    {
        for (var visited of this.visitedLocations)
        {
            if (visited.date != date)
            {
                continue;
            }
            var result = (visited.locations.indexOf(location) != -1);
            return result;
        }
        return false;
    }

    isUsedDescribe(id)
    {
        for (var used of this.usedDescribe)
        {
            if (used == id)
            {
                return true;
            }
        }
        return false;
    }

    notifyUsedDescribe(id)
    {
        if (id == null)
        {
            return;
        }
        this.usedDescribe.push(id);
    }

    setTemporaryVariable(key, value)
    {
        this.temporaryVariables[key] = value;
    }

    getTemporaryVariable(key)
    {
        var result = this.temporaryVariables[key];
        return result;
    }

    removeTemporaryVariable(key)
    {
        this.temporaryVariables[key] = null;
    }
}

new QuestManager();
