const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow = null;
app.on('ready', () =>
{
    // mainWindow を作成
    mainWindow = new BrowserWindow(
        {
            width: 1920,
            height: 1080,
        });

    // メニュー非表示
    mainWindow.setMenu(null);

    // html を指定
    let path = 'file://' + __dirname + '/app/index.html';
    mainWindow.loadURL(path);

    // developper tool を開く
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function ()
    {
        mainWindow = null;
    });
});