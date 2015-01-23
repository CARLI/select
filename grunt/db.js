
module.exports = function (grunt) {
    var projectRoot = __dirname + '/..';

    grunt.registerTask('deploy-db', function() {
        var done = this.async();
        grunt.task.run(['subdir-exec:'+projectRoot+'/db:./deploy']);
    });
    grunt.registerTask('fixture-data', function() {
        grunt.task.run(['subdir-exec:'+projectRoot+'/db:./fixtures.js']);
    });
};
