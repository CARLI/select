
module.exports = function (grunt) {
    var projectRoot = __dirname + '/..';
    var deployDb = require(projectRoot+'/db/deploy.js');

    grunt.registerTask('deploy-db', [
        'deploy-app-db',
        'deploy-otp-cycle'
    ]);
    grunt.registerTask('deploy-design-docs', [
        'deploy-app-design-doc',
        'deploy-cycle-design-docs'
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
    grunt.registerTask('deploy-app-design-doc', function() {
        var done = this.async();
        deployDb.deployLocalAppDesignDoc().then(done);
    });
    grunt.registerTask('deploy-cycle-design-docs', function() {
        var done = this.async();
        deployDb.deployLocalCycleDesignDocs().then(done)
            .catch(function(err){
                console.log('error deploying Local Cycle Design Docs',err);
            });
    });
    grunt.registerTask('fixture-data', function() {
        grunt.task.run(['subdir-exec:'+projectRoot+'/db:./fixtures.js']);
    });
};
