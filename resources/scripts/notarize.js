require('dotenv').config();
const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context)
{
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin')
  {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    appBundleId: 'app.kazuhideoka.doomsday',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
    ascProvider: process.env.ASC_PROVIDER
  });
};
