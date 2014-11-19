module.exports = function(grunt) {
    require('../grunt/subdir')(grunt);
    require('../grunt/jsenv')(grunt);
    require('../grunt/couchDbConfig')(grunt);

    grunt.registerTask('ensure-local-config', ensureLocalConfigExists);

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
};
