var seleniumHost = process.env.SELENIUM_PORT_4444_TCP_ADDR || 'localhost';
var seleniumPort = process.env.SELENIUM_PORT_4444_TCP_PORT || '4444';

exports.config = {
    seleniumAddress: 'http://' + seleniumHost + ':' + seleniumPort + '/wd/hub',
    specs: ['carliApp/sections/**/*.spec.js']
};
