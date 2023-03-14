class MoveEvent extends Event
{
    constructor(args)
    {
        super("move", 3, -1);
        this.nextStageIndex = Number(args[0]);
        this.preSpeak = Type.toBoolean(args[1]);
        this.waitTime = 0;
        this.follower = null;
    }

    setupEvent(survivor, stage)
    {
        if (survivor.hasEvent(MoveFollowEvent))
        {
            return;
        }

        var next = globalSystem.locationManager.getStage(this.nextStageIndex);
        if (next == stage)
        {
            if (this.executeType == Event.executeType.call)
            {
                survivor.speak("move_failed", []);
            }
            return;
        }

        if (this.preSpeak)
        {
            if (next.visitCount == 0)
            {
                survivor.speak("find_move", [next.bridge]);
            }
            else
            {
                survivor.speak("pre_move", [next.bridge]);
            }

            globalSystem.cameraManager.requestBgRandom("focusBg");
            var fg = globalSystem.uiManager.foreground.getElement(survivor.image);
            if (fg != null)
            {
                var walkTime = 1;
                var newFg = globalSystem.uiManager.foreground.addImage(fg.id, ForegroundElement.defaultType, fg.costume, fg.positionType, walkTime);
                if (newFg != null)
                {
                    newFg.walkOut(walkTime, true);
                }
            }

            this.waitTime = 1;
        }

        this.requestMoveFollow(survivor, next, this.preSpeak);

        globalSystem.soundManager.playSe("walk00");
    }

    executeEvent(survivor, stage)
    {
        if (survivor.hasEvent(MoveFollowEvent))
        {
            return true;
        }

        var next = globalSystem.locationManager.getStage(this.nextStageIndex);
        if (next == stage)
        {
            return true;
        }

        if (this.waitTime > 0)
        {
            this.waitTime -= globalSystem.time.deltaTime;
            return false;
        }

        if (this.follower != null && this.follower.isValid)
        {
            if (this.follower.hasEvent(QuestEndEvent))
            {
                return true;
            }

            if (this.follower.currentStage != next)
            {
                // 再びリクエスト
                this.requestMoveFollow(survivor, next, false);
                return false;
            }
        }

        if (this.preSpeak)
        {
            var fg = globalSystem.uiManager.foreground.getElement(survivor.image);
            if (fg != null)
            {
                var walkTime = 1;
                var newFg = globalSystem.uiManager.foreground.addImage(fg.id, ForegroundElement.defaultType, fg.costume, fg.positionType, walkTime);
                if (newFg != null)
                {
                    newFg.walkIn(walkTime, true);
                }
            }
        }
        else
        {
            // 次に呼ばれたときのために、speakフラグをリセット
            this.preSpeak = true;
        }

        /*
        if (next.locked)
        {
            var unlock = survivor.getItemByType("unlock");
            if (unlock == null)
            {
                survivor.speak("move_locked", []);
                next.onVisit();
                return true;
            }
            else
            {
                survivor.speak("move_unlock", [unlock.name]);
                survivor.removeItem(unlock);
                survivor.pushEvent(new ItemGetEvent(["rarity", 2]), Event.executeType.event);
                next.locked = false;
            }
        }
        */

        survivor.speak("move", [next.name]);

        this.pushSceneDescribe(survivor, next);

        // まれに順番入れ替え
        if (Random.range(4) != 0)
        {
            this.pushObjectDescribe(survivor, next);
            this.pushBridgeDescribe(survivor, next);
        }
        else
        {
            this.pushBridgeDescribe(survivor, next);
            this.pushObjectDescribe(survivor, next);
        }

        var alreadySpeaks = next.getEventsByType(SpeakEvent);
        if (alreadySpeaks.length == 0)
        {
            var speakVisit = new SpeakEvent(["visitStage", null, null, 2]);
            next.pushEvent(speakVisit);
        }

        survivor.setStage(next);
        if (next != null)
        {
            next.onVisit();
        }
        if (stage != null)
        {
            stage.onLeave();
        }

        globalSystem.cameraManager.requestFg("reset01");
        globalSystem.cameraManager.requestRandom("moveBg");
        globalSystem.cameraManager.requestRandom("moveFg");

        //survivor.insertEvent(new GreetingEvent(), Event.executeType.event);

        return true;
    }

    exitEvent(survivor, stage)
    {
        survivor.pushCallEvent(this);
        if (this.follower != null)
        {
            this.follower.pushCallEvent(this);
        }
        this.follower = null;
    }

    pushSceneDescribe(survivor, next)
    {
        if (next.visitCount > 0)
        {
            return;
        }

        var sceneDescribe = new StageSceneDescribeEvent();
        sceneDescribe.target = survivor;
        next.pushEvent(sceneDescribe);
    }

    pushObjectDescribe(survivor, next)
    {
        var objectDescribe = null;
        if (next.visitCount == 0)
        {
            var objectDescribe = new StageObjectDescribeEvent();
            objectDescribe.target = survivor;
            next.pushEvent(objectDescribe);
        }
        else
        {
            var callObjects = next.getEventsByType(CallObjectEvent);
            if (callObjects.length > 0)
            {
                var objectDescribe = new StageObjectSecondaryDescribeEvent();
                objectDescribe.target = survivor;
                next.pushEvent(objectDescribe);
            }
        }
    }

    pushBridgeDescribe(survivor, next)
    {
        var alreadyBridgeDescribes = next.getEventsByType(BridgeDescribeEvent);
        if (alreadyBridgeDescribes.length > 0)
        {
            return;
        }

        var bridgeDescribe = new BridgeDescribeEvent(next.nextIndex);
        // bridgeDescribe.target = survivor;
        next.pushEvent(bridgeDescribe);
    }

    getCallWords(survivor, stage)
    {
        var next = globalSystem.locationManager.getStage(this.nextStageIndex);
        if (next == null)
        {
            return [];
        }
        return [next.name, next.bridge];
    }

    getProbability()
    {
        var next = globalSystem.locationManager.getStage(this.nextStageIndex);
        var ratio = (1.0 / ((next.visitCount * 3) + 1)) * 0.6;
        return ratio;
    }

    isContinuable()
    {
        return true;
    }

    requestMoveFollow(survivor, nextStage, preSpeak)
    {
        if (globalSystem.survivorManager.survivorCount <= 1)
        {
            return;
        }

        for (var other of globalSystem.survivorManager.survivors)
        {
            if (other == survivor)
            {
                continue;
            }
            if (other.isDead)
            {
                continue;
            }
            if (other.hasEvent(MoveFollowEvent))
            {
                continue;
            }
            if (other.currentEvent != null && other.currentEvent instanceof MoveFollowEvent)
            {
                continue;
            }

            other.pushEvent(new MoveFollowEvent(this.nextStageIndex, preSpeak), Event.executeType.event);
            if (preSpeak)
            {
                survivor.speak("pre_moveFollowRequest", [nextStage.bridge]);
            }
            this.follower = other;
        }
    }
}
