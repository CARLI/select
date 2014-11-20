var buildConfig = require('./build.config');

var seleniumHost = process.env.SELENIUM_PORT_4444_TCP_ADDR || 'localhost';
var seleniumPort = process.env.SELENIUM_PORT_4444_TCP_PORT || '4444';

exports.config = {
    seleniumAddress: 'http://' + seleniumHost + ':' + seleniumPort + '/wd/hub',
    specs: buildConfig.carliApp_files.jsE2e,
    onPrepare: function() {
        require('jasmine-bail-fast');
        jasmine.getEnv().bailFast();
        require('jasmine-spec-reporter');
        jasmine.getEnv().addReporter(new jasmine.SpecReporter({displayStacktrace: true}));
        require('jasmine-reporters');
        jasmine.getEnv().addReporter(new jasmine.JUnitXmlReporter('../artifacts/test-results', true, true));
    },
    jasmineNodeOpts: {
        silent: true
    }
    /*
    , capabilities: {
        browserName: 'chrome'
    }
    */
    /*
    , multiCapabilities: [
        { 'browserName': 'firefox' },
        { 'browserName': 'chrome' }
    ]
    */
};
