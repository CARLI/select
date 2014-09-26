/**
 * This file/module contains all configuration for the build process.
 */
module.exports = {
    /**
     * The `build_dir` folder is where our projects are compiled during
     * development and the `compile_dir` folder is where our carliApp resides once it's
     * completely built.
     */
    build_dir: 'build',
    compile_dir: 'dist',

    /**
     * Convenient groups of files used for copying, building, etc.
     */
    carliApp_files: {
        js: [ 'carliApp/**/*.js', '!app/**/*.spec.js' ],
        jsUnit: ['carliApp/**/*.spec.js'],
        jsAll: ['carliApp/**/*.js'],
        index: ['carliApp/index.html'],
        html: ['carliApp/**/*.html', '!app/index.html']
    },

    /**
     * Stand-alone JavaScript files that get packaged by Browserify.
     * Browserify will set up a global (window) variable for the package logic files.
     */
    logic_files: {
        global_var: 'Carli',
        js: '../CARLI/CARLI.js',
        build: 'CARLI.js'
    },

    /**
     * This is a collection of files used during testing only.
     */
    test_files: {
        js: ['bower_modules/angular-mocks/angular-mocks.js']
    },

    /**
     * This is the same as `carliApp_files`, except it contains patterns that
     * reference vendor code (`bower_modules/`) that we need to place into the build
     * process somewhere. While the `carliApp_files` property ensures all
     * standardized files are collected for compilation, it is the user's job
     * to ensure non-standardized (i.e. vendor-related) files are handled
     * carliAppropriately in `vendor_files.js`.
     *
     * The `vendor_files.js` property holds files to be automatically
     * concatenated and minified with our project source files.
     *
     */
    vendor_files: {
        js: [
            'bower_modules/angular/angular.js',
            'bower_modules/angular-route/angular-route.js'
        ]
    }
};
