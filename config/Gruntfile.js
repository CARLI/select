var fs = require('fs');

module.exports = function (grunt) {
    grunt.registerTask('jsenv', setJsEnv);

    var localConfigFile = __dirname + '/../config/local.js';
    grunt.registerTask('ensure-local-config', ensureLocalConfigExists);
    function ensureLocalConfigExists() {
        fs.closeSync(fs.openSync(localConfigFile, 'a'));
    }

    function setJsEnv(env) {
        switch (env) {
            case 'browser':
                writeEnvironmentRequestModule('browser');
                break;
            case 'node':
                writeEnvironmentRequestModule('node');
                break;
            default:
                throw Error('Invalid environment: ' + env + ', valid options are "node" and "browser"');
        }
    }
};

function writeEnvironmentRequestModule(module) {
    fs.writeFileSync(__dirname + '/environmentDependentModules.js', "module.exports = require('./"+ module +"Environment');\n");
}

