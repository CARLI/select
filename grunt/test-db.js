
module.exports = function (grunt) {
    var projectRoot = __dirname + '/..';
    var testUtils = require(projectRoot + '/CARLI/test/utils');
    var deployDb = require(projectRoot+'/db/deploy');

    grunt.registerTask('deploy-test-db', [
        'deploy-test-app-db',
        'deploy-test-otp-cycle'
    ]);
    grunt.registerTask('deploy-test-app-db', function() {
        var done = this.async();
        testUtils.setupTestDb();
        deployDb.deployDb(testUtils.testDbName).then(done);
        //grunt.task.run(['subdir-exec:'+projectRoot+'/db:./deploy.sh ' + testUtils.testDbName ]);
    });
    grunt.registerTask('deploy-test-otp-cycle', function() {
        var done = this.async();
        var cycleName = testUtils.testDbMarker + ' otp-cycle-tests';
        testUtils.setupTestDb();
        deployDb.createOneTimePurchaseCycle(cycleName, testUtils.getTestDbStore()).then(done);
        //grunt.task.run(['subdir-exec:'+projectRoot+'/db:./deploy.sh ' + testUtils.testDbName ]);
    });
    grunt.registerTask('delete-test-dbs', function() {
        var done = this.async();
        var config = require('../config');
        Logger.log(config.storeOptions);
        testUtils.deleteTestReplicators()
            .then(testUtils.deleteTestDbs)
            .then(function(){
                Logger.log('Done deleting test DBs');
                done();
            });
    });
    grunt.registerTask('nuke-couch', function() {
        var done = this.async();
        testUtils.nukeCouch().then(done);
    });
};
