
module.exports = function (grunt) {
    var projectRoot = __dirname + '/..';
    var testUtils = require(projectRoot + '/CARLI/test/utils');

    grunt.registerTask('deploy-db', function() {
        grunt.task.run(['subdir-exec:'+projectRoot+'/db:./deploy']);
    });
    grunt.registerTask('deploy-test-db', function() {
        grunt.task.run(['subdir-exec:'+projectRoot+'/db:./deploy ' + testUtils.testDbName ]);
    });
    grunt.registerTask('fixture-data', function() {
        grunt.task.run(['subdir-exec:'+projectRoot+'/db:./fixtures.js']);
    });
    grunt.registerTask('delete-test-dbs', function() {
        var testUtils = require(projectRoot + '/CARLI/test/utils.js');
        var done = this.async();
        testUtils.deleteTestDbs().then(done);
    });
};
