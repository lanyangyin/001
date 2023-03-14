class GameManager extends GlobalManager
{
    constructor()
    {
        super("gameManager");

        this.isBooted = false;
    }

    setup()
    {
        // プラットフォームごとの設定
        PlatformSetting.apply();

        // ショートカットキー登録
        ShortCutKey.setup();

        // 最初のフローへ
        globalSystem.flowManager.setFlow(new SplashFlow());
    }

    update()
    {
    }

    load()
    {
        // テスト機能セットアップ
        TestSwitch.setup();

        // ロード
        SaveSystem.load();

        // 初期化
        this.initialize();

        // ブート完了
        this.isBooted = true;
    }

    initialize()
    {
        // サバイバーが一人もいないなら、追加
        if (globalSystem.survivorManager.survivors.length == 0)
        {
            var survivorData0 = globalSystem.survivorData.getDataByIndex(0, 0);
            globalSystem.survivorManager.pushSurvivor(new Survivor(0, survivorData0));
        }

        if (globalSystem.scenarioManager.openDate.length == 0)
        {
            var date = globalSystem.scenarioManager.startDate;
            globalSystem.scenarioManager.openDate.push(date);
        }

        // ブート時フラグチェック
        if (this.isBooted == false)
        {
            globalSystem.flagManager.check("boot");
        }
    }

    resetToTitle()
    {
        globalSystem.resetManagers();
    }

    exit()
    {
        globalSystem.uiManager.dialog.addButton(0, Terminology.get("yes"), () => { window.close(); });
        globalSystem.uiManager.dialog.addButton(1, Terminology.get("no"), () => { globalSystem.uiManager.dialog.close(); });
        globalSystem.uiManager.dialog.open(Terminology.get("confirm_exit"));
    }
}

new GameManager();
