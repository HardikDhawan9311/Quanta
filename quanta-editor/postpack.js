const { execSync } = require('child_process');
const path = require('path');

exports.default = async function (context) {
    if (context.electronPlatformName !== 'darwin') {
        return;
    }

    const appPath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);

    console.log(`\n📦 Removing macOS quarantine attributes via xattr -cr for: ${appPath}`);

    try {
        execSync(`xattr -cr "${appPath}"`);
        console.log(`✅ Successfully removed quarantine attributes from Quanta Studio.app!`);
    } catch (err) {
        console.error(`❌ Failed to run xattr: ${err}`);
    }
};
