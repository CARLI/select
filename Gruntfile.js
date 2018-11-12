
var dockerRegistry = 'carli-select-integration.pixodev.net:5000';

var buildDockerRepository = 'carli-select/build';
var browserClientsDockerRepository = 'carli-select/browser-clients';
var middlewareDockerRepository = 'carli-select/middleware';

var buildImageVersion = 'latest';
var browserClientsVersion = require('./browserClient/package.json').version;
var middlewareVersion = require('./middleware/package.json').version;

var buildDockerImage = `${dockerRegistry}/${buildDockerRepository}:${buildImageVersion}`;
var browserClientsDockerImage = `${dockerRegistry}/${browserClientsDockerRepository}:${browserClientsVersion}`;
var middlewareDockerImage = `${dockerRegistry}/${middlewareDockerRepository}:${middlewareVersion}`;

module.exports = function (grunt) {
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
            serveHeadless: {
                tasks: ['subdir-grunt:middleware:serve', 'subdir-grunt:browserClient:serve:headless']
            },
            serveCompiled: {
                tasks: ['subdir-grunt:middleware:serve', 'subdir-grunt:browserClient:serveCompiled']
            }
        },
        exec: {
            dockerBuildBuildImage: {
                command: `docker build --target build --tag ${buildDockerImage} .`,
                stdout: true,
                stderr: true,
                options: { cwd: '.' }
            },
            dockerBuildBrowserClientsImage: {
                command: `docker build --target browser-clients --tag ${browserClientsDockerImage} .`,
                stdout: true,
                stderr: true,
                options: { cwd: '.' }
            },
            dockerBuildMiddlewareImage: {
                command: `docker build --target middleware --tag ${middlewareDockerImage} .`,
                stdout: true,
                stderr: true,
                options: { cwd: '.' }
            },
            dockerPushBrowserClientsImage: {
                command: `docker push ${browserClientsDockerImage}`,
                stdout: true,
                stderr: true,
                options: { cwd: '.' }
            },
            dockerPushMiddlewareImage: {
                command: `docker push ${middlewareDockerImage}`,
                stdout: true,
                stderr: true,
                options: { cwd: '.' }
            }
        }
    });

    grunt.registerTask('serve', 'Run both the middleware and dev server', ['concurrent:serve']);
    grunt.registerTask('serve:headless', 'Run both the middleware and a headless dev server', ['concurrent:serve:headless']);
    grunt.registerTask('serve:compiled', 'Run both the middleware and the dev server with compiled app code', ['concurrent:serveCompiled']);

    grunt.registerTask('test', 'Run the unit tests for the CARLI modules', function (arg) {
        grunt.task.run(['subdir-grunt:CARLI:test:' + arg]);
    });

    grunt.registerTask('docker:build:build', 'Build the docker image that is used to build the other images', [
        'exec:dockerBuildBuildImage'
    ]);
    grunt.registerTask('docker:build:middleware', 'Build the middleware docker image', [
        'exec:dockerBuildMiddlewareImage'
    ]);
    grunt.registerTask('docker:build:browserClients', 'Build the browser clients docker image', [
        'exec:dockerBuildBrowserClientsImage'
        // 'subdir-grunt:browserClient:compile', // this now happens in the Dockerfile
    ]);
    grunt.registerTask('docker:build', 'Build all docker images', [
        'docker:build:middleware',
        'docker:build:browserClients'
    ]);

    grunt.registerTask('docker:push:middleware', 'Push the middleware image', [ 'exec:dockerPushMiddlewareImage' ]);
    grunt.registerTask('docker:push:browserClients', 'Push the browser clients image', [ 'exec:dockerPushBrowserClientsImage' ]);
    grunt.registerTask('docker:push', 'Push all runtime images', [
        'docker:push:middleware',
        'docker:push:browserClients'
    ]);

    grunt.registerTask('docker:publish:middleware', 'Build and push the middleware image', [
        'docker:build:middleware',
        'docker:push:middleware'
    ]);
    grunt.registerTask('docker:publish:browserClients', 'Build and push the browser clients image', [
        'docker:build:browserClients',
        'docker:push:browserClients'
    ]);
    grunt.registerTask('docker:publish', 'Build and push all runtime images', [
        'docker:build:build',
        'docker:publish:middleware',
        'docker:publish:browserClients'
    ]);


    // grunt.registerTask('docker-build:browserClients', 'Build the Nginx web server image', [
    //     'subdir-grunt:browserClient:compile',
    //     'exec:dockerBuildBrowserClientsImage',
    //     'exec:dockerPublishBrowserClientsImage'
    // ]);
    // grunt.registerTask('docker-build:middleware', 'Build the Node middleware image', [
    //     'exec:dockerBuildMiddlewareImage',
    //     'exec:dockerPublishMiddlewareImage'
    // ]);
    // grunt.registerTask('docker-build', 'Build all Docker images', [
    //     'docker-build:browserClients',
    //     'docker-build:middleware'
    // ]);
};
