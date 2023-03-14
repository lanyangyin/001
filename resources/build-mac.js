const builder = require('electron-builder');

builder.build({
    config: {
        'appId': 'app.kazuhideoka.doomsday',
        'mac': {
            "target": [
                "dmg"
            ],
            //"icon": "icons/icon256x256.png"
        }
    }
});

// > node build-mac.js
