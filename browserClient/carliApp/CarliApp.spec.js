var ip = require('ip');
var devServerUrl = 'http://' + ip.address() + ':8000';

var CarliApp = function () {
    this.navBar = {
        dashboard: element(by.id('nav-dashboard')),
        vendors: element(by.id('nav-vendors')),
        styleGuide: element(by.id('nav-style-guide'))
    };

    this.getDefaultAppPage = function () {
        browser.get(devServerUrl);
    };
};

module.exports = CarliApp;
