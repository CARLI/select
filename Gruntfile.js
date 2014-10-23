module.exports = function(grunt) {

    grunt.registerTask('subdir-grunt', subdirGruntTask);
    grunt.registerTask('subdir-exec', subdirExecTask);

    grunt.registerTask('test', function(arg) {
        grunt.task.run(['subdir-grunt:browserClient:test:' + arg]);
        grunt.task.run(['subdir-exec:CARLI:npm test:' + arg]);
    });

    grunt.registerTask('npm-install', function() {
        grunt.task.run(['subdir-exec:browserClient:npm install']);
        grunt.task.run(['subdir-exec:CARLI:npm install']);
    });
    grunt.registerTask('bower-install', function() {
        grunt.task.run(['subdir-exec:browserClient:bower --allow-root install']);
    });

    grunt.registerTask('install-deps', [
        'npm-install',
        'bower-install'
    ]);

    function subdirGruntTask(dir, task) {
        var done = this.async();
        var spawnArgs = {
            grunt: true,
            args: [ task ],
            opts: {
                cwd: dir,
                stdio: 'inherit'
            }
        };

        grunt.log.writeln('* Entering ' + dir);
        grunt.util.spawn(spawnArgs, spawnCallback(dir, done));
    }
    function subdirExecTask(dir, commandString) {
        var done = this.async();

        var args = commandString.split(' ');
        var command = args.shift();

        var spawnArgs = {
            cmd: command,
            args:  args,
            opts: {
                cwd: dir,
                stdio: 'inherit'
            }
        };

        grunt.log.writeln('* Entering ' + dir);
        grunt.util.spawn(spawnArgs, spawnCallback(dir, done));
    }

    function spawnCallback(dir, done) {
        return function (err, result, code) {
            if (err == null) {
                grunt.log.writeln('* Finished ' + dir);
                done();
            }
            else {
                grunt.log.writeln('! ' + dir + ' failed: ' + code);
                done(false);
            }
        };
    }
};
