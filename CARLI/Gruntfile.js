var fs = require('fs');

var localConfigFile = './config/local.js';

module.exports = function(grunt) {
    require('../grunt/subdir')(grunt);
    require('../grunt/jsenv')(grunt);

    grunt.registerTask('ensure-local-config', ensureLocalConfigExists);
    grunt.registerTask('container-config', generateContainerConfig);

    grunt.registerTask('npm-test', function(arg) {
        grunt.task.run(['subdir-exec:.:npm test']);
    });

    grunt.registerTask('test', [
        'ensure-local-config',
        'jsenv:node',
        'npm-test'
    ]);

    function ensureLocalConfigExists() {
        fs.closeSync(fs.openSync(localConfigFile, 'a'));
    }

    function generateContainerConfig(instance) {
        if (instance === undefined) {
            instance = 'dev';
        }
        var url = _getCouchDbUrlFor(instance);

        var cfg = '';
        cfg += "module.exports = {\n";
        cfg += "    storeOptions: {\n";
        cfg += "        couchDbUrl: "+ url +"\n";
        cfg += "        couchDbName: 'testy'\n";
        cfg += "    }\n";
        cfg += "}";

        fs.writeFileSync(localConfigFile, cfg);
    }

    function _getCouchDbUrlFor(instance) {
        switch (instance) {
            case 'dev':
                return 'http://carli-db.dev.pixotech.com';
            case 'qa':
                return 'http://carli-db.qa.pixotech.com';
            default:
                throw new Error('Invalid instance: ' + instance);
        }
    }
};
