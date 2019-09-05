const config = require('../../config');

function getConfig(key) {
    return config.isConfigSafeToExposeToWebBrowser(key) ? config.getConfig(key) : "";
}

module.exports = {
    getConfig: getConfig,
};
