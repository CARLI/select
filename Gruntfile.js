var registryName = 'docker.pixodev.net:5000';
var webVersion = require('./browserClient/package.json').version;
var middlewareVersion = require('./middleware/package.json').version;

module.exports = function (grunt) {
    require('./grunt/subdir')(grunt);
    require('./config/Gruntfile')(grunt);
    require('./grunt/db')(grunt);
    require('./grunt/test-db')(grunt);
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        clean: {
            docker: ['docker/build/web', 'docker/build/middleware']
        },
        copy: {
            webDocker: {
                files: [{
                    src: 'compile/**',
                    dest: 'docker/build/web',
                    expand: true,
                    cwd: 'browserClient'
                }]
            },
            middlewareDocker: {
                files: [{
                    src: ['CARLI/**', 'config/**', 'db/**', 'middleware/**', 'schemas/**'],
                    dest: 'docker/build/middleware',
                    expand: true
                }]
            }
        },
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            serve: {
                tasks: ['subdir-grunt:middleware:serve', 'subdir-grunt:browserClient:serve']
            },
            serveHeadless: {
                tasks: ['subdir-grunt:middleware:serve', 'subdir-grunt:browserClient:serve:headless']
            },
            serveCompiled: {
                tasks: ['subdir-grunt:middleware:serve', 'subdir-grunt:browserClient:serveCompiled']
            }
        },
        exec: {
            webDocker: {
                command: `docker build -f Dockerfile-web -t ${registryName}/web:${webVersion} .`,
                stdout: true,
                stderr: true,
                options: {
                    cwd: 'docker'
                }
            },
            middlewareDocker: {
                command: `docker build -f Dockerfile-middleware -t ${registryName}/middleware:${middlewareVersion} .`,
                stdout: true,
                stderr: true,
                options: {
                    cwd: 'docker'
                }
            }
        }
    });

    grunt.registerTask('serve', ['concurrent:serve']);
    grunt.registerTask('serve:headless', ['concurrent:serve:headless']);
    grunt.registerTask('serve:compiled', ['concurrent:serveCompiled']);

    grunt.registerTask('test', function (arg) {
        grunt.task.run(['subdir-grunt:CARLI:test:' + arg]);
    });

    grunt.registerTask('docker-build:web', [
        'clean:docker',
        'subdir-grunt:browserClient:compile',
        'copy:webDocker',
        'exec:webDocker'
    ]);
    grunt.registerTask('docker-build:middleware', [
        'clean:docker',
        'copy:middlewareDocker',
        'exec:middlewareDocker'
    ]);
    grunt.registerTask('docker-build', [
        'docker-build:web',
        'docker-build:middleware'
    ]);

    //TODO: push to repository (or intermediate, `docker save` to tarball, and rsync)
};
