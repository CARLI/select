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
            docker: ['docker/build']
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
                    src: ['bin/**', 'CARLI/**', 'config/**', 'db/**', 'grunt/**', 'middleware/**', 'schemas/**'],
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
                command: `docker build --no-cache -f Dockerfile-web -t ${webDockerImageName} .`,
                stdout: true,
                stderr: true,
                options: {
                    cwd: 'docker'
                }
            },
            dockerBuildMiddlewareImage: {
                command: `docker build --no-cache -f Dockerfile-middleware -t ${middlewareDockerImageName} .`,
                stdout: true,
                stderr: true,
                options: {
                    cwd: 'docker'
                }
            },
            dockerSaveImageWeb: {
                command: `docker save -o ../artifacts/carliDockerImageWeb${webVersion}.tar ${webDockerImageName}`,
                stdout: true,
                stderr: true,
                options: {
                    cwd: 'docker'
                }
            },
            dockerSaveImageMiddleware: {
                command: `docker save -o ../artifacts/carliDockerImageMiddleware${middlewareVersion}.tar ${middlewareDockerImageName}`,
                stdout: true,
                stderr: true,
                options: {
                    cwd: 'docker'
                }
            }
        }
    });

    grunt.registerTask('serve', 'Run both the middleware and dev server', ['concurrent:serve']);
    grunt.registerTask('serve:headless', 'Run both the middleware and a headless dev server', ['concurrent:serve:headless']);
    grunt.registerTask('serve:compiled', 'Run both the middleware and the dev server with compiled app code', ['concurrent:serveCompiled']);

    grunt.registerTask('test', 'Run the unit tests for the CARLI modules', function (arg) {
        grunt.task.run(['subdir-grunt:CARLI:test:' + arg]);
    });

    grunt.registerTask('docker-build:web', 'Build the Nginx web server image', [
        'clean:docker',
        'subdir-grunt:browserClient:compile',
        'copy:filesForDockerWebImage',
        'exec:dockerBuildWebImage',
        'exec:dockerSaveImageWeb'
    ]);
    grunt.registerTask('docker-build:middleware', 'Build the Node middleware image', [
        'clean:docker',
        'copy:filesForDockerMiddlewareImage',
        'exec:dockerBuildMiddlewareImage',
        'exec:dockerSaveImageMiddleware'
    ]);
    grunt.registerTask('docker-build', 'Build all Docker images', [
        'docker-build:web',
        'docker-build:middleware'
    ]);
};
