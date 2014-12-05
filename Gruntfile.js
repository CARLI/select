module.exports = function(grunt) {
    require('./grunt/subdir')(grunt);
    require('./grunt/jsenv')(grunt);
    require('./grunt/db')(grunt);

    grunt.registerTask('test', function(arg) {
        grunt.task.run(['subdir-grunt:browserClient:test:' + arg]);
        grunt.task.run(['subdir-grunt:CARLI:test:' + arg]);
    });

    grunt.registerTask('npm-install', function() {
        grunt.task.run(['subdir-exec:.:npm install']);
        grunt.task.run(['subdir-exec:browserClient:npm install']);
        grunt.task.run(['subdir-exec:browserClient/e2e:npm install']);
        grunt.task.run(['subdir-exec:CARLI:npm install']);
        grunt.task.run(['subdir-exec:db:npm install']);
    });
    grunt.registerTask('bower-install', function() {
        grunt.task.run(['subdir-exec:browserClient:bower --allow-root install']);
    });

    grunt.registerTask('install-deps', [
        'npm-install',
        'bower-install'
    ]);
};
