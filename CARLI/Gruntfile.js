var fs = require('fs');

module.exports = function(grunt) {
    require('../grunt/subdir')(grunt);
    require('../grunt/jsenv')(grunt);
    require('../grunt/carliConfig')(grunt);
    require('../grunt/db')(grunt);
    require('../grunt/test-db')(grunt);

    grunt.registerTask('npm-test', function(arg) {
        grunt.task.run(['subdir-exec:.:npm test']);
    });

    grunt.registerTask('test', [
        'ensure-local-config',
        'jsenv:node',
        'deploy-test-db',
        'npm-test',
        'delete-test-dbs'
    ]);
};
