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

    function generateContainerConfig() {
        var host = process.env.COUCHDB_PORT_5984_TCP_ADDR;
        var port = process.env.COUCHDB_PORT_5984_TCP_PORT;

        if (host === undefined || port === undefined) {
            console.log('Couch container link not found');
            return;
        }

        var cfg = '';
        cfg += "module.exports = {\n";
        cfg += "    storeOptions: {\n";
        cfg += "        couchDbUrl: 'http://"+host+":"+port+"',\n";
        cfg += "        couchDbName: 'CARLI'\n";
        cfg += "    }\n";
        cfg += "}"

        fs.writeFileSync(localConfigFile, cfg);
    }
};
