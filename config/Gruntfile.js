var fs = require('fs');

module.exports = function (grunt) {
    grunt.registerTask('jsenv', setJsEnv);

    var localConfigFile = __dirname + '/../config/local.js';
    var environmentDependentModulesFile = __dirname + '/environmentDependentModules.js';
    grunt.registerTask('ensure-local-config', ensureLocalConfigExists);
    function ensureLocalConfigExists() {
        fs.closeSync(fs.openSync(localConfigFile, 'a'));
        fs.closeSync(fs.openSync(environmentDependentModulesFile, 'a'));
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

    function writeEnvironmentRequestModule(module) {
        fs.writeFileSync(environmentDependentModulesFile, "module.exports = require('./"+ module +"Environment');\n");
    }
};
