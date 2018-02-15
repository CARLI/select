
module.exports = function (grunt) {
    var projectRoot = __dirname + '/..';
    var deployDb = require(projectRoot+'/db/deploy.js');

    grunt.registerTask('bootstrap-db', [
        'create-admin-user',
        'deploy-db'
    ]);
    grunt.registerTask('create-admin-user', function createAdminUser() {
        var done = this.async();
        deployDb.createAdminUser().then(done);
    });
    grunt.registerTask('create-pixo-users', function createAdminUser() {
        var done = this.async();
        createUsers().then(done);

        function createUsers() {
            return deployDb.createUsersFromJson('./pixo-staff-users.json')
                .then(function () {
                    return deployDb.createUsersFromJson('./carli-staff-users.json');
                });
        }
    });
    grunt.registerTask('deploy-db', [
        'deploy-app-db',
        'deploy-otp-cycle',
        'deploy-activity-log-db'
    ]);
    grunt.registerTask('deploy-design-docs', [
        'deploy-app-design-doc',
        'deploy-cycle-design-docs',
        'deploy-activity-log-design-doc'
    ]);
    grunt.registerTask('deploy-app-db', function() {
        var done = this.async();
        deployDb.deployDb().then(done);
        //grunt.task.run(['subdir-exec:'+projectRoot+'/db:./deploy.sh ' + testUtils.testDbName ]);
    });
    grunt.registerTask('deploy-otp-cycle', function() {
        var done = this.async();
        deployDb.createOneTimePurchaseCycle().then(done);
        //grunt.task.run(['subdir-exec:'+projectRoot+'/db:./deploy.sh ' + testUtils.testDbName ]);
    });
    grunt.registerTask('deploy-activity-log-db', function() {
        var done = this.async();
        deployDb.deployActivityLogDb().then(done);
    });
    grunt.registerTask('deploy-app-design-doc', function() {
        var done = this.async();
        deployDb.deployLocalAppDesignDoc().then(done);
    });
    grunt.registerTask('deploy-activity-log-design-doc', function() {
        var done = this.async();
        deployDb.deployDesignDocToActivityLog().then(done);
    });
    grunt.registerTask('deploy-cycle-design-docs', function() {
        var done = this.async();
        deployDb.deployLocalCycleDesignDocs().then(done)
            .catch(function(err){
                Logger.log('error deploying Local Cycle Design Docs',err);
            });
    });
    grunt.registerTask('fixture-data', function() {
        grunt.task.run(['subdir-exec:'+projectRoot+'/db:./fixtures.js']);
    });
};
