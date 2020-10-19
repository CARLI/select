var fs = require('fs');

module.exports = function(grunt) {
    require('../grunt/subdir')(grunt);
    require('../config/Gruntfile')(grunt);
    require('../grunt/db')(grunt);
    require('../grunt/test-db')(grunt);

    grunt.registerTask('npm-test', function(arg) {
        grunt.task.run(['subdir-exec:.:npm test']);
    });

    grunt.registerTask('npm-test-plain', function(arg) {
        grunt.task.run(['subdir-exec:.:mocha']);
    });

    grunt.registerTask('test', [
        'ensure-local-config',
        'jsenv:node',
        'delete-test-dbs',
        'deploy-test-db',
        'npm-test',
        'delete-test-dbs'
    ]);

    grunt.registerTask('pre-plaintest', [
        'ensure-local-config',
        'jsenv:node',
        'delete-test-dbs',
        'deploy-test-db',
    ]);

    grunt.registerTask('plaintest', [
        'ensure-local-config',
        'jsenv:node',
        'delete-test-dbs',
        'deploy-test-db',
        'npm-test-plain',
        'delete-test-dbs'
    ]);
};
