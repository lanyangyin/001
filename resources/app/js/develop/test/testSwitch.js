class TestSwitch
{
    static enabled = false;

    static name = "CLOSED ALPHA TEST";
    static version = "alpha_20220628";
    static target = "シナリオ確認用";

    static setup()
    {
        //TestSwitch.enable();
    }

    static enable()
    {
        TestSwitch.enabled = true;

        var versionElement = document.getElementById("copyright");
        if (versionElement != null)
        {
            versionElement.innerHTML = `<span style='color:#FF0000'>${TestSwitch.name} ver.${TestSwitch.version}<br>このパッケージは${TestSwitch.name}＜${TestSwitch.target}＞です。再配布は禁止されています。</span>`;
        }
        var watermarkElement = document.getElementById("developWatermark");
        if (watermarkElement != null)
        {
            watermarkElement.innerHTML = `${TestSwitch.name} ver.${TestSwitch.version}<br>このパッケージは${TestSwitch.name}＜${TestSwitch.target}＞です。<br>スクリーンショット、キャプチャ動画等の公開は禁止されています。`;
        }

        var message = `このパッケージは${TestSwitch.name}＜${TestSwitch.target}＞です。<br><br>グラフィック、システム、サウンド、シナリオ外の演出の多くは仮のものです。<br>シナリオの確認にのみご利用ください。<br><br>シナリオは「物語」画面の右下の「次の物語を進める」ボタンを押すことで進行します。`;
        globalSystem.uiManager.dialog.open(message);
    }
}
