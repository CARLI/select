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
        js: [ 'carliApp/**/*.js', '!carliApp/**/*.spec.js'],
        jsUnit: ['carliApp/components/**/*.spec.js'],
        jsE2e: ['carliApp/sections/**/*.spec.js'],
        jsAll: ['carliApp/**/*.js'],
        index: ['carliApp/index.html'],
        html: ['carliApp/**/*.html', '!carliApp/index.html'],
        css: ['carliApp/**/*.scss', 'carliApp/**/*.css'],
        images: ['carliApp/**/*.png'],
        json: ['resources/**/*.json']
    },

    /**
     * Stand-alone JavaScript files that get packaged by Browserify.
     * Browserify will set up a global (window) variable for the package logic files.
     */
    logic_files: {
        global_var: 'CARLI',
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
            'bower_modules/angular-route/angular-route.js',
            'bower_modules/angular-resource/angular-resource.js',
            'bower_modules/angular-fontawesome/dist/angular-fontawesome.js'
        ],
        css: [
            'bower_modules/font-awesome/css/font-awesome.min.css'
        ],
        fonts: [
            'bower_modules/font-awesome/fonts/fontawesome-webfont.*'
        ]
    }
};
