class QuestFlow extends Flow
{
    constructor()
    {
        super("quest", true);
    }

    get isSaveOnExit()
    {
        var result = true;

        var completeArea = globalSystem.areaManager.isCompleteArea();
        result = result && completeArea;

        var next = globalSystem.flowManager.nextFlow;
        if (next != null)
        {
            var beforeTitle = next instanceof TitleFlow;
            result = result && (beforeTitle == false);
        }

        return result;
    }

    setupFlow()
    {
        // 背景セットアップ
        var image = globalSystem.locationManager.location.image;
        if (StringExtension.isNullOrEmpty(image) == false)
        {
            globalSystem.uiManager.background.setImage(image);
        }
        // 前景セットアップ
        this.setupForeground();

        // UIセットアップ
        for (var i = 0; i < globalSystem.uiManager.status.length; i++)
        {
            globalSystem.uiManager.status[i].setupInfo();
            globalSystem.uiManager.status[i].updateInfo();
        }
        for (var i = 0; i < globalSystem.uiManager.textLine.length; i++)
        {
            globalSystem.uiManager.textLine[i].setupElement("quest");
            globalSystem.uiManager.textLine[i].reset();
        }

        // サウンドセットアップ
        var bgm = globalSystem.locationManager.location.sound;
        if (bgm)
        {
            var overwriteBgm = this.getBgmInInventory();
            if (overwriteBgm != null)
            {
                bgm = overwriteBgm;
            }
            if (globalSystem.soundManager.currentBgmId != bgm)
            {
                globalSystem.soundManager.pauseBgm();
            }
            globalSystem.soundManager.playBgm(bgm);
        }
        else
        {
            globalSystem.soundManager.pauseBgm();
        }

        // カメラ演出
        globalSystem.cameraManager.request("enterQuest00");
        globalSystem.cameraManager.request("enterQuest01");
        globalSystem.cameraManager.enableRandomMove();

        // inputのロック解除
        globalSystem.textInputManager.unlock();

        // サバイバーのロックを強制解除
        globalSystem.survivorManager.unlockForce();
    }

    updateFlow()
    {
        globalSystem.questManager.updateQuest();
        globalSystem.survivorManager.updateSurvivors();
    }

    exitFlow()
    {
        // ストーリーフローに行っても同じBGMを鳴らしたい場合があるため、ポーズしない
        //globalSystem.soundManager.pauseBgm();

        globalSystem.cameraManager.disableRandomMove();

        globalSystem.soundManager.pauseSe();
        globalSystem.uiManager.background.clearImage(1);
        globalSystem.uiManager.foreground.clear();
        for (var textInput of globalSystem.uiManager.textInput)
        {
            textInput.reset();
        }
    }

    setupForeground()
    {
        globalSystem.uiManager.foreground.clear();

        var survivors = globalSystem.survivorManager.survivors;
        switch (survivors.length)
        {
            case 1:
                {
                    globalSystem.uiManager.foreground.addImage(survivors[0].image, ForegroundElement.defaultType, survivors[0].getCostume(), "right-right");
                }
                break;
            case 2:
                {
                    globalSystem.uiManager.foreground.addImage(survivors[1].image, ForegroundElement.defaultType, survivors[1].getCostume(), "center-rigtht");
                    globalSystem.uiManager.foreground.addImage(survivors[0].image, ForegroundElement.defaultType, survivors[0].getCostume(), "center-left");
                }
            default:
                break;
        }

        for (var i = 0; i < survivors.length; i++)
        {
            if (survivors[i].isValid)
            {
                continue;
            }
            var element = globalSystem.uiManager.foreground.getElement(survivors[i].image);
            element.fadeOut(0, true);
        }
    }

    getBgmInInventory()
    {
        var musics = [];
        var survivors = globalSystem.survivorManager.survivors;
        for (var survivor of survivors)
        {
            var items = survivor.getItemsByType("music");
            musics = musics.concat(items);
        }

        if (musics.length == 0)
        {
            return null;
        }

        var index = Random.range(musics.length);
        var music = musics[index];
        var result = music.arg0;
        return result;
    }
}