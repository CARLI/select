exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['carliApp/sections/**/*.spec.js'],
    multiCapabilities: [
        {
            'browserName': 'firefox'
        },
        {
            'browserName': 'chrome'
        }
    ]
};
