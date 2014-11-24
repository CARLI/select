var ip = require('ip');
var devServerUrl = 'http://' + ip.address() + ':8000';

module.exports = {
    devServerUrl: devServerUrl,
    getDefaultAppPage: function(){
        browser.get(devServerUrl);
    }
};
