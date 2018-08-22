
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
    grunt.registerTask('deploy-db', 'Create couch databases for CARLI, One-Time Purchases, and Activity log and deploy design docs to each', [
        'deploy-app-db',
        'deploy-otp-cycle',
        'deploy-activity-log-db'
    ]);
    grunt.registerTask('deploy-design-docs', 'Deploy design docs for CARLI, One-Time Purchases, and Activity Log databases', [
        'deploy-app-design-doc',
        'deploy-cycle-design-docs',
        'deploy-activity-log-design-doc'
    ]);
    grunt.registerTask('deploy-app-db', 'Create the CARLI database and deploy design and security docs to it', function() {
        var done = this.async();
        deployDb.deployDb().then(done);
        //grunt.task.run(['subdir-exec:'+projectRoot+'/db:./deploy.sh ' + testUtils.testDbName ]);
    });
    grunt.registerTask('deploy-otp-cycle', 'Create the One-Time Purchase database and deploy its design docs', function() {
        var done = this.async();
        deployDb.createOneTimePurchaseCycle().then(done);
        //grunt.task.run(['subdir-exec:'+projectRoot+'/db:./deploy.sh ' + testUtils.testDbName ]);
    });
    grunt.registerTask('deploy-activity-log-db', 'Create the Activity Log database and deploy its design docs', function() {
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
};
