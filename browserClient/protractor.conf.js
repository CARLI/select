var buildConfig = require('./build.config');

var seleniumHost = process.env.SELENIUM_PORT_4444_TCP_ADDR || 'localhost';
var seleniumPort = process.env.SELENIUM_PORT_4444_TCP_PORT || '4444';

exports.config = {
    seleniumAddress: 'http://' + seleniumHost + ':' + seleniumPort + '/wd/hub',
    specs: buildConfig.carliApp_files.jsE2e,
    onPrepare: function() {
        require('jasmine-spec-reporter');
        jasmine.getEnv().addReporter(new jasmine.SpecReporter({displayStacktrace: true}));
    },
    jasmineNodeOpts: {
        silent: true
    }
};
