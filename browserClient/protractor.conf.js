var buildConfig = require('./build.config');

var seleniumHost = process.env.SELENIUM_PORT_4444_TCP_ADDR || 'localhost';
var seleniumPort = process.env.SELENIUM_PORT_4444_TCP_PORT || '4444';

var options = {
    enableScreenshots: getEnvironmentYesNoOption('CARLI_TEST_ENABLE_SCREENSHOTS', false),
    enableChrome: getEnvironmentYesNoOption('CARLI_TEST_ENABLE_CHROME', true),
    enableFirefox: getEnvironmentYesNoOption('CARLI_TEST_ENABLE_FIREFOX', false),
    enableSharding: getEnvironmentYesNoOption('CARLI_TEST_ENABLE_SHARDING', true),
    maxInstances: process.env.CARLI_TEST_MAX_INSTANCES || 4
};

var multiCapabilities = getMulticapabilities(options);

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

        if (options.enableScreenshots) {
            var ScreenShotReporter = require('protractor-html-screenshot-reporter');
            jasmine.getEnv().addReporter(new ScreenShotReporter({
                baseDirectory: '../artifacts/test-results/screenshots'
            }));
        }
    },
    jasmineNodeOpts: {
        silent: true,
        defaultTimeoutInterval: 60000
    },
    multiCapabilities: multiCapabilities
};

function getEnvironmentYesNoOption(varName, deflt) {
    if (process.env[varName] === undefined) {
        return deflt;
    }
    if (process.env[varName].toUpperCase() === 'YES') {
        return true;
    }
    if (process.env[varName].toUpperCase() === 'NO') {
        return false;
    }
    return deflt;
}

function getMulticapabilities(options) {
    var multiCapabilities = [];

    function browserCapabilities(browserName, options) {
        var caps = { browserName: browserName };
        if (options.enableSharding) {
            caps.shardTestFiles = true;
            caps.maxInstances = options.maxInstances;
        }
        return caps;
    }

    if (options.enableChrome) {
        console.log('enabling chrome');
        multiCapabilities.push(browserCapabilities('chrome', options));
    }
    if (options.enableFirefox) {
        console.log('enabling firefox');
        multiCapabilities.push(browserCapabilities('firefox', options));
    }
    return multiCapabilities;
}
