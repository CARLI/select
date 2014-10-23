var seleniumHost = process.env.SELENIUM_PORT_4444_TCP_ADDR || 'localhost';
var seleniumPort = process.env.SELENIUM_PORT_4444_TCP_PORT || '4444';

exports.config = {
    seleniumAddress: 'http://' + seleniumHost + ':' + seleniumPort + '/wd/hub',
    /* TODO: should come from build.config.js */
    specs: ['carliApp/*.spec.js','carliApp/sections/**/*.spec.js'],
    onPrepare: function() {
        require('jasmine-spec-reporter');
        jasmine.getEnv().addReporter(new jasmine.SpecReporter({displayStacktrace: true}));
    },
    jasmineNodeOpts: {
        silent: true
    }
};
