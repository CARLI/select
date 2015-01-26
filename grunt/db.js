
module.exports = function (grunt) {
    var projectRoot = __dirname + '/..';
    var deployDb = require(projectRoot+'/db/deploy.js');

    grunt.registerTask('deploy-db', function() {
        //grunt.task.run(['subdir-exec:'+projectRoot+'/db:./deploy.sh']);
        var done = this.async();
        deployDb('carli').finally(done);
    });
    grunt.registerTask('fixture-data', function() {
        grunt.task.run(['subdir-exec:'+projectRoot+'/db:./fixtures.js']);
    });
};
