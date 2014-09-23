/**
 * This file/module contains all configuration for the build process.
 */
module.exports = {
    /**
     * The `build_dir` folder is where our projects are compiled during
     * development and the `compile_dir` folder is where our app resides once it's
     * completely built.
     */
    build_dir: 'build',
    compile_dir: 'dist',

    /**
     * Convenient groups of files used for copying, building, etc.
     */
    app_files: {
        js: [ 'app/**/*.js', '!app/**/*.spec.js' ],
        jsUnit: ['app/**/*.spec.js'],
        jsAll: ['app/**/*.js'],
        index: ['app/index.html'],
        html: ['app/**/*.html', '!app/index.html']
    },

    /**
     * Stand-alone JavaScript files that get packaged by Browserify.
     * Browserify will set up a global (window) variable for the package logic files.
     */
    logic_files: {
        global_var: 'Carli',
        js: 'CARLI/CARLI.js',
        build: 'CARLI.js'
    },

    /**
     * This is a collection of files used during testing only.
     */
    test_files: {
        js: ['vendor/angular-mocks/angular-mocks.js']
    },

    /**
     * This is the same as `app_files`, except it contains patterns that
     * reference vendor code (`vendor/`) that we need to place into the build
     * process somewhere. While the `app_files` property ensures all
     * standardized files are collected for compilation, it is the user's job
     * to ensure non-standardized (i.e. vendor-related) files are handled
     * appropriately in `vendor_files.js`.
     *
     * The `vendor_files.js` property holds files to be automatically
     * concatenated and minified with our project source files.
     *
     */
    vendor_files: {
        js: [
            'vendor/angular/angular.js',
            'vendor/angular-route/angular-route.js'
        ]
    }
};
