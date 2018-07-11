var registryName = 'docker.pixodev.net:5000';

var webVersion = require('./browserClient/package.json').version;
var middlewareVersion = require('./middleware/package.json').version;

var webDockerImageName = `${registryName}/web:${webVersion}`;
var middlewareDockerImageName = `${registryName}/middleware:${middlewareVersion}`;

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
            filesForDockerWebImage: {
                files: [{
                    src: 'compile/**',
                    dest: 'docker/build/web',
                    expand: true,
                    cwd: 'browserClient'
                }]
            },
            filesForDockerMiddlewareImage: {
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
            dockerBuildWebImage: {
                command: `docker build -f Dockerfile-web -t ${webDockerImageName} .`,
                stdout: true,
                stderr: true,
                options: {
                    cwd: 'docker'
                }
            },
            dockerBuildMiddlewareImage: {
                command: `docker build -f Dockerfile-middleware -t ${middlewareDockerImageName} .`,
                stdout: true,
                stderr: true,
                options: {
                    cwd: 'docker'
                }
            },
            dockerSaveImageWeb: {
                command: `docker save ${webDockerImageName} -o ../artifacts/carliDockerImageWeb${webVersion}.tar`,
                stdout: true,
                stderr: true,
                options: {
                    cwd: 'docker'
                }
            },
            dockerSaveImageMiddleware: {
                command: `docker save ${middlewareDockerImageName} -o ../artifacts/carliDockerImageMiddleware${middlewareVersion}.tar`,
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
        'copy:filesForDockerWebImage',
        'exec:dockerBuildWebImage'
    ]);
    grunt.registerTask('docker-build:middleware', [
        'clean:docker',
        'copy:filesForDockerMiddlewareImage',
        'exec:dockerBuildMiddlewareImage'
    ]);
    grunt.registerTask('docker-build', [
        'docker-build:web',
        'docker-build:middleware'
    ]);

    grunt.registerTask('docker-save-images', [
        'exec:dockerSaveImageWeb',
        'exec:dockerSaveImageMiddleware'
    ]);

    //TODO: push to repository
};
