
module.exports = function (grunt) {
    var projectRoot = __dirname + '/..';
    var testUtils = require(projectRoot + '/CARLI/test/utils');
    var deployDb = require(projectRoot+'/db/deploy.js');

    grunt.registerTask('deploy-test-db', function() {
        //var done = this.async();
        //deployDb(testUtils.testDbName).then(done);
        grunt.task.run(['subdir-exec:'+projectRoot+'/db:./deploy ' + testUtils.testDbName ]);
    });
    grunt.registerTask('delete-test-dbs', function() {
        var done = this.async();
        testUtils.deleteTestDbs().then(done);
    });
    grunt.registerTask('nuke-couch', function() {
        var done = this.async();
        testUtils.nukeCouch().then(done);
    });
};
