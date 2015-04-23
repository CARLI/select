var fs = require('fs');

module.exports = function (grunt) {

    var localConfigFile = __dirname + '/../config/local.js';
    var environmentDependentModulesDirectory = __dirname + '/environmentDependentModules';
    var environmentDependentModules = [
        'request',
        'couchApp',
        'crmQueries'
    ];

    grunt.registerTask('ensure-local-config', ensureLocalConfigExists);

    function ensureLocalConfigExists() {
        touch(localConfigFile);

        environmentDependentModules.map(getModuleFilename).forEach(touch);
    }

    grunt.registerTask('jsenv', setJsEnv);

    function setJsEnv(env) {
        environmentDependentModules.forEach(function (module) {
            writeEnvironmentModule(env, module);
        });
    }

    function writeEnvironmentModule(environment, module) {
        fs.writeFileSync(getModuleFilename(module),
            "module.exports = require('./"+ environment +"/"+ module +"');\n");
    }

    function getModuleFilename(module) {
        return environmentDependentModulesDirectory + '/' + module + '.js';
    }

    function touch(file) {
        fs.closeSync(fs.openSync(file, 'a'));
    }
};
