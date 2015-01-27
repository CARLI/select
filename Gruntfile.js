module.exports = function(grunt) {
    require('./grunt/subdir')(grunt);
    require('./config/Gruntfile')(grunt);
    require('./grunt/db')(grunt);
    require('./grunt/test-db')(grunt);
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            serve: {
                tasks: ['subdir-grunt:middleware:serve', 'subdir-grunt:browserClient:serve']
            },
            serveProtractor: {
                tasks: ['subdir-grunt:middleware:serve', 'subdir-grunt:browserClient:serve:protractor' ]
            },
            serveHeadless: {
                tasks: ['subdir-grunt:middleware:serve', 'subdir-grunt:browserClient:serve:headless' ]
            }
        }
    });

    grunt.registerTask('serve', ["concurrent:serve"]);
    grunt.registerTask('serve:protractor', ["concurrent:serve:protractor"]);
    grunt.registerTask('serve:headless', ["concurrent:serve:headless"]);

    grunt.registerTask('test', function(arg) {
        grunt.task.run(['subdir-grunt:CARLI:test:' + arg]);
        grunt.task.run(['subdir-grunt:browserClient:test:' + arg]);
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
        'ensure-local-config',
        'npm-install',
        'bower-install'
    ]);
};
