/**
 * This file/module contains all configuration for the build process.
 */

var build_dir = 'build';
var compile_dir = 'compile';
var package_json = require('./package.json');
var version = package_json.version;

function compile_base(app){
    return compile_dir + '/' + app + 'App/';
}

var bower_css = [
    'bower_modules/angular-busy/angular-busy.css',
    'bower_modules/ng-tags-input/ng-tags-input.css',
    'bower_modules/angular-slider/slider.css'
];

var bower_fonts = [
    'bower_modules/font-awesome/fonts/fontawesome-webfont.*'
];

var bower_js = [
    'bower_modules/jquery/dist/jquery.js',
    'bower_modules/angular/angular.js',
    'bower_modules/angular-animate/angular-animate.js',
    'bower_modules/angular-busy/angular-busy.js',
    'bower_modules/angular-busyclick/src/busyClick.directive.js',
    'bower_modules/angular-route/angular-route.js',
    'bower_modules/angular-resource/angular-resource.js',
    'bower_modules/angular-sanitize/angular-sanitize.js',
    'bower_modules/angular-slider/slider.js',
    'bower_modules/bootstrap-sass-official/assets/javascripts/bootstrap.js',
    'bower_modules/angular-bootstrap/ui-bootstrap.js',
    'bower_modules/angular-bootstrap/ui-bootstrap-tpls.js',
    'bower_modules/FileSaver/FileSaver.js',
    'bower_modules/gsap/src/minified/TweenMax.min.js',
    'bower_modules/gsap/src/minified/jquery.gsap.min.js',
    'bower_modules/handlebars/handlebars.js',
    'bower_modules/moment/moment.js',
    'bower_modules/ng-tags-input/ng-tags-input.js'
];

module.exports = {
    /**
     * The `build_dir` folder is where our projects are compiled during
     * development and the `compile_dir` folder is where our carliApp resides once it's
     * completely built.
     */
    build_dir: build_dir,
    compile_dir: compile_dir,

    browserify_file: function(app){
        return compile_base(app) + 'browserify.js';
    },
    annotated_js_file: function(app){
        return compile_base(app) + 'app.annotated.js';
    },
    annotated_iife_js_file: function(app){
        return compile_base(app) + 'app.annotated.iffe.js';
    },
    processed_sass_file: function(app){
        return compile_base(app) + 'app.compiled.css';
    },
    compiled_js_file: function(app){
        return compile_base(app) + 'app.' + version +'.js';
    },
    compiled_css_file: function(app){
        return compile_base(app) + 'app.' + version + '.css';
    },
    compiled_index_file: function(app){
        return compile_base(app) + 'index.html';
    },

    common_components: {
        all_files: [
            'common/**/*',
            '!common/**/*.spec.js'
        ],
        all_js: [
            'common/**/*.js',
            '!common/**/*.spec.js'
        ],
        annotated_js_file: compile_dir + '/common/common.annotated.js',
        annotated_iife_js_file: compile_dir + '/common/common.annotated.iife.js',
        favicons: 'common/favicons/*',
        sass_all: 'common/**/*.scss'
    },

    carli_app: {
        all_files: [
            'carliApp/**/*',
            '!carliApp/**/*.spec.js'
        ],
        all_web_files: [
            'carliApp/**/*.html',
            'carliApp/**/*.handlebars',
            'carliApp/**/*.png',
            'carliApp/**/*.svg'
        ],
        all_js: [
            'carliApp/*.js',
            'carliApp/**/*.js',
            '!carliApp/**/*.spec.js'
        ],
        build_dir: build_dir + '/carliApp/',
        compile_dir: compile_dir + '/carliApp/',
        sass_main: 'carliApp/styles/app.scss',
        sass_all: 'carliApp/**/*.scss',
        test_js: [
            'carliApp/**/*.spec.js'
        ]
    },

    library_app: {
        all_files: [
            'libraryApp/**/*',
            '!libraryApp/**/*.spec.js'
        ],
        all_web_files: [
            'libraryApp/**/*.html',
            'libraryApp/**/*.handlebars',
            'libraryApp/**/*.png',
            'libraryApp/**/*.svg'
        ],
        all_js: [
            'libraryApp/*.js',
            'libraryApp/**/*.js',
            '!libraryApp/**/*.spec.js'
        ],
        build_dir: build_dir + '/libraryApp/',
        compile_dir: compile_dir + '/libraryApp/',
        sass_main: 'libraryApp/styles/app.scss',
        sass_all: 'libraryApp/**/*.scss',
        test_js: [
            'libraryApp/**/*.spec.js'
        ]
    },

    vendor_app: {
        all_files: [
            'vendorApp/**/*',
            '!vendorApp/**/*.spec.js'
        ],
        all_web_files: [
            'vendorApp/**/*.html',
            'vendorApp/**/*.handlebars',
            'vendorApp/**/*.png',
            'vendorApp/**/*.svg'
        ],
        all_js: [
            'vendorApp/*.js',
            'vendorApp/**/*.js',
            '!vendorApp/**/*.spec.js'
        ],
        build_dir: build_dir + '/vendorApp/',
        compile_dir: compile_dir + '/vendorApp/',
        sass_main: 'vendorApp/styles/app.scss',
        sass_all: 'vendorApp/**/*.scss',
        test_js: [
            'vendorApp/**/*.spec.js'
        ]
    },

    bower_css: bower_css,
    bower_fonts: bower_fonts,
    bower_js: bower_js,
    bower_files: bower_css.concat(bower_js).concat(bower_fonts),

    /**
     * Stand-alone JavaScript files that get packaged by Browserify.
     * Browserify will set up a global (window) variable for the package logic files.
     */
    logic_files: {
        global_var: 'CARLI',
        build: 'CARLI.js'
    }
};
