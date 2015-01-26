module.exports = function (grunt) {
    require('../grunt/subdir')(grunt);

    grunt.registerTask('serve', function (arg) {
        grunt.task.run(['subdir-exec:.:node ./index.js']);
    });
};