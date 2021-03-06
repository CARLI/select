module.exports = function (grunt) {
    grunt.registerTask('subdir-grunt', subdirGruntTask);
    grunt.registerTask('subdir-exec', subdirExecTask);

    function subdirGruntTask (dir, task, arg) {
        var done = this.async();
        var args = task;
        if (arg !== undefined) {
            args += ':' + arg;
        }
        var spawnArgs = {
            grunt: true,
            args: [ args ],
            opts: {
                cwd: dir,
                stdio: 'inherit'
            }
        };

        grunt.util.spawn(spawnArgs, spawnCallback(dir, done));
    };

    function subdirExecTask (dir, commandString) {
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

        grunt.util.spawn(spawnArgs, spawnCallback(dir, done));
    }

    function spawnCallback(dir, done) {
        return function (err, result, code) {
            if (err == null) {
                done();
            }
            else {
                done(false);
            }
        };
    }
};

