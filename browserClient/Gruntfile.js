module.exports = function ( grunt ) {

    var _ = require('lodash');

    require('load-grunt-tasks')(grunt);
    require('../config/Gruntfile')(grunt);
    require('../grunt/subdir')(grunt);
    require('../grunt/db')(grunt);
    require('../grunt/test-db')(grunt);

    var user_config = require( './build.config.js' );

    var task_config = {
        pkg: grunt.file.readJSON("package.json"),

        browserify: {
            options: {
                browserifyOptions: {
                    standalone: user_config.logic_files.global_var,
                    debug: true
                }
            },
            carli: {
                files: [{
                    src: 'carliAppModule.js',
                    dest: user_config.carli_app.build_dir + user_config.logic_files.build
                }]
            },
            library: {
                files: [{
                    src: 'libraryAppModule.js',
                    dest: user_config.library_app.build_dir + user_config.logic_files.build
                }]
            },
            vendor: {
                files: [{
                    src: 'vendorAppModule.js',
                    dest: user_config.vendor_app.build_dir + user_config.logic_files.build
                }]
            }
        },

        clean: [ user_config.build_dir, user_config.compile_dir ],

        concat: {
            /* TODO for each app */
        },

        connect: {
            options: {
                hostname: '0.0.0.0',
                base: 'build/',
                livereload: 35729
            },

            serveCarli: {
                options: {
                    open: 'http://staff.carli.local:8080',
                    port: 8000,
                    middleware: function (connect, options) {
                        var optBase = (typeof options.base === 'string') ? [options.base] : options.base;
                        var modRewrite = require('connect-modrewrite');

                        return [modRewrite(['!(\\..+)$ /carliApp/index.html [L]'])].concat(
                            optBase.map(function(path){ return connect.static(path); }));
                    }
                }
            },

            serveLibrary: {
                options: {
                    open: 'http://library.carli.local:8002',
                    port: 8002,
                    middleware: function (connect, options) {
                        var optBase = (typeof options.base === 'string') ? [options.base] : options.base;
                        var modRewrite = require('connect-modrewrite');

                        return [modRewrite(['!(\\..+)$ /libraryApp/index.html [L]'])].concat(
                            optBase.map(function(path){ return connect.static(path); }));
                    }
                }
            },

            serveVendor: {
                options: {
                    open: 'http://vendor.carli.local:8080',
                    port: 8001,
                    middleware: function (connect, options) {
                        var optBase = (typeof options.base === 'string') ? [options.base] : options.base;
                        var modRewrite = require('connect-modrewrite');

                        return [modRewrite(['!(\\..+)$ /vendorApp/index.html [L]'])].concat(
                            optBase.map(function(path){ return connect.static(path); }));
                    }
                }
            }
        },

        copy: {
            carli_app_common_components: {
                files: [{
                    src: user_config.common_components.all_files,
                    dest: user_config.carli_app.build_dir,
                    expand: true
                }]
            },
            carli_app_all_files: {
                files: [{
                    src: user_config.carli_app.all_files,
                    dest: user_config.build_dir,
                    expand: true
                }]
            },
            carli_app_bower_files: {
                files: [{
                    src: user_config.bower_files,
                    dest: user_config.carli_app.build_dir
                }]
            },

            library_app_common_components: {
                files: [{
                    src: user_config.common_components.all_files,
                    dest: user_config.library_app.build_dir,
                    expand: true
                }]
            },
            library_app_all_files : {
                files: [{
                    src: user_config.library_app.all_files,
                    dest: user_config.build_dir,
                    expand: true
                }]
            },
            library_app_bower_files: {
                files: [{
                    src: user_config.bower_files,
                    dest: user_config.library_app.build_dir
                }]
            },

            vendor_app_common_components: {
                files: [{
                    src: user_config.common_components.all_files,
                    dest: user_config.vendor_app.build_dir,
                    expand: true
                }]
            },
            vendor_app_all_files : {
                files: [{
                    src: user_config.vendor_app.all_files,
                    dest: user_config.build_dir,
                    expand: true
                }]
            },
            vendor_app_bower_files: {
                files: [{
                    src: user_config.bower_files,
                    dest: user_config.vendor_app.build_dir
                }]
            }
        },

        /**
         * The `index` task compiles the `index.html` file as a Grunt template. CSS
         * and JS files co-exist here but they get split apart later.
         */
        index: {
            carli: {
                options: {
                    base: 'carliApp'
                },
                files: [{
                    expand: true,
                    cwd: user_config.carli_app.build_dir,
                    src: [
                        user_config.logic_files.build,
                        user_config.bower_files,
                        user_config.common_components.all_files,
                        '*.js',
                        '**/*.js'
                    ]
                }]
            },

            library: {
                options: {
                    base: 'libraryApp'
                },
                files: [{
                    expand: true,
                    cwd: user_config.library_app.build_dir,
                    src: [
                        user_config.logic_files.build,
                        user_config.bower_files,
                        user_config.common_components.all_files,
                        '*.js',
                        '**/*.js'
                    ]
                }]
            },

            vendor: {
                options: {
                    base: 'vendorApp'
                },
                files: [{
                    expand: true,
                    cwd: user_config.vendor_app.build_dir,
                    src: [
                        user_config.logic_files.build,
                        user_config.bower_files,
                        user_config.common_components.all_files,
                        '*.js',
                        '**/*.js'
                    ]
                }]
            },

            /**
             * When it is time to have a completely compiled application, we can
             * alter the above to include only a single JavaScript and a single CSS
             * file. Now we're back!
             */
            compile: {
                /* TODO: for each app */
            }
        },

        jshint: {
            src: [
                user_config.carli_app.all_js,
                user_config.library_app.all_js,
                user_config.vendor_app.all_js
            ],
            test: [
                user_config.carli_app.test_js,
                user_config.library_app.test_js,
                user_config.vendor_app.test_js
            ],
            gruntfile: [
                'Gruntfile.js'
            ],
            options: {
                curly: true,
                immed: true,
                newcap: true,
                noarg: true,
                sub: true,
                boss: true,
                eqnull: true,
                globals: {
                    'angular': false
                }
            }
        },

        karma: {
            options: {
                basePath: '.',
                port: 9876,
                singleRun: true,
                browsers: [ 'PhantomJS' ],
                frameworks: [ 'mocha', 'chai' ],
                reporters: [ 'mocha', 'junit' ]
            },
            carli: {
                files: {
                    src: [
                        'build/carliApp/bower_modules/jquery/dist/jquery.js',
                        'build/carliApp/bower_modules/angular/angular.js',
                        'bower_modules/angular-mocks/angular-mocks.js',
                        'testModules/*.js',
                        'build/carliApp/*.js',
                        'build/carliApp/**/*.js',
                        'carliApp/**/*.spec.js'
                    ]
                },
                junitReporter: {
                    outputFile: '../artifacts/test-results/browserClient-unit.xml'
                }
            },
            library: {
                files: {
                    src: [
                        'build/libraryApp/bower_modules/jquery/dist/jquery.js',
                        'build/libraryApp/bower_modules/angular/angular.js',
                        'bower_modules/angular-mocks/angular-mocks.js',
                        'testModules/*.js',
                        'build/libraryApp/*.js',
                        'build/libraryApp/**/*.js',
                        'libraryApp/**/*.spec.js'
                    ]
                },
                junitReporter: {
                    outputFile: '../artifacts/test-results/libraryApp-unit.xml'
                }
            },
            vendor: {
                files: {
                    src: [
                        'build/vendorApp/bower_modules/jquery/dist/jquery.js',
                        'build/vendorApp/bower_modules/angular/angular.js',
                        'bower_modules/angular-mocks/angular-mocks.js',
                        'testModules/*.js',
                        'build/vendorApp/*.js',
                        'build/vendorApp/**/*.js',
                        'vendorApp/**/*.spec.js'
                    ]
                },
                junitReporter: {
                    outputFile: '../artifacts/test-results/vendorApp-unit.xml'
                }
            }
        },

        ngAnnotate: {
            /* TODO for compile task for each app */
        },

        ngdocs: {
            options: {
                dest: '../artifacts/docs',
                html5Mode: true,
                startPage: '/api',
                title: "CARLI Angular Docs",
                image: "https://bitbucket-assetroot.s3.amazonaws.com/c/photos/2014/Sep/22/carli-select-logo-2067750528-2_avatar.png",
                imageLink: "https://jira.pixotech.com/browse/CARLI/",
                titleLink: "https://jira.pixotech.com/browse/CARLI/", 
                bestMatch: true
            },
            api: {
                src: user_config.carli_app.all_js,
                title: 'API Documentation'
            }
        },

        sass: {
            options: {
                loadPath: '.'
            },

            carli: {
                files: [{
                    src: user_config.carli_app.sass_main,
                    dest: user_config.carli_app.build_dir,
                    ext: '.css',
                    expand: true,
                    flatten: true
                }]
            },

            library: {
                files: [{
                    src: user_config.library_app.sass_main,
                    dest: user_config.library_app.build_dir,
                    ext: '.css',
                    expand: true,
                    flatten: true
                }]
            },

            vendor: {
                files: [{
                    src: user_config.vendor_app.sass_main,
                    dest: user_config.vendor_app.build_dir,
                    ext: '.css',
                    expand: true,
                    flatten: true
                }]
            }
        },

        uglify: {
            /* TODO for compile task for each app */
        },

        watch: {
            options: {
                livereload: true
            },

            filesChangedCarli: {
                files: user_config.carli_app.all_files,
                tasks: ['newer:copy:carli_app_all_files', 'index:carli']
            },
            filesChangedLibrary: {
                files: user_config.library_app.all_files,
                tasks: ['newer:copy:library_app_all_files', 'index:library']
            },
            filesChangedVendor: {
                files: user_config.vendor_app.all_files,
                tasks: ['newer:copy:vendor_app_all_files', 'index:vendor']
            },
            filesChangedCommon: {
                files: ['common/**/*.html', 'common/**/*.js'],
                tasks: [
                    'newer:copy:carli_app_common_components',
                    'newer:copy:library_app_common_components',
                    'newer:copy:vendor_app_common_components']
            },

            sassCarli: {
                files: user_config.carli_app.sass_all,
                tasks: ['sass:carli']
            },
            sassLibrary: {
                files: user_config.library_app.sass_all,
                tasks: ['sass:library']
            },
            sassVendor: {
                files: user_config.vendor_app.sass_all,
                tasks: ['sass:vendor']
            },
            sassCommon: {
                files: user_config.common_components.sass_all,
                tasks: ['sass:carli','sass:library','sass:vendor']
            }
        }
    };

    grunt.initConfig( _.extend( task_config, user_config ) );

    /** 
     * The index.html template includes the stylesheet and javascript sources
     * based on dynamic names calculated in this Gruntfile. This task assembles
     * the list into variables for the template to use and then runs the
     * compilation.
     */
    grunt.registerMultiTask( 'index', 'Process index.html template', function () {
        var options = this.options();

        var indexFile = options.base + '/index.html';
        var targetIndexFile = 'build/' + indexFile;

        var basePathRegExp = new RegExp('^('+ user_config.build_dir + ')\/', 'g');

        var normalizedFiles = this.filesSrc.map(stripBuildBasePath).map(addAppBasePath);
        var jsFiles = normalizedFiles.filter(jsFilesOnly);

        var cssFiles = normalizedFiles.filter(cssFilesOnly);

        grunt.file.copy(indexFile, targetIndexFile, {
            process: function( contents, path ) {
                return grunt.template.process( contents, {
                    data: {
                        scripts: jsFiles,
                        styles: cssFiles
                    }
                });
            }
        });


        function jsFilesOnly (file) {
            return file.match( /\.js$/ );
        }

        function cssFilesOnly (file) {
            return file.match( /\.css$/ );
        }

        function stripBuildBasePath(file){
            return file.replace(basePathRegExp, '');
        }

        function addAppBasePath(file){
            if ( file.indexOf(options.base) !== 0 ){
                return options.base + '/' + file;
            }
            return file;
        }
    });

    grunt.registerTask( 'build', [
        'clean',
        'build:carli',
        'build:library',
        'build:vendor'
    ]);

    grunt.registerTask( 'build:carli', [
        'jsenv:browser',
        'ensure-local-config',
        'jshint',
        'browserify:carli',
        'copy:carli_app_common_components',
        'copy:carli_app_all_files',
        'copy:carli_app_bower_files',
        'sass:carli',
        'index:carli',
        'jsenv:node'
    ]);

    grunt.registerTask('build:library', [
        'jsenv:browser',
        'ensure-local-config',
        'jshint',
        'browserify:library',
        'copy:library_app_common_components',
        'copy:library_app_all_files',
        'copy:library_app_bower_files',
        'sass:library',
        'index:library',
        'jsenv:node'
    ]);

    grunt.registerTask('build:vendor', [
        'jsenv:browser',
        'ensure-local-config',
        'jshint',
        'browserify:vendor',
        'copy:vendor_app_common_components',
        'copy:vendor_app_all_files',
        'copy:vendor_app_bower_files',
        'sass:vendor',
        'index:vendor',
        'jsenv:node'
    ]);


    /**
     * Use `grunt test` to run unit tests once
     */
    grunt.registerTask( 'test', [
        'test:unit'
    ]);

    /**
     * This does not require the dev server to be running
     */
    grunt.registerTask( 'test:unit', [
        'clean',
        'build',
        'karma:carli',
        'karma:library',
        'karma:vendor'
    ]);

    grunt.registerTask( 'test:jenkins', [
        'test:unit'
    ]);

    /*
     * The `serve` task is used during development to preview the app and live reload 
     */
    grunt.registerTask( 'serve', [
        'build',
        'connect:serveCarli',
        'connect:serveLibrary',
        'connect:serveVendor',
        'watch'
    ]);

    /**
     * The `compile` task gets your app ready for deployment by concatenating and
     * minifying your code.
     */
    grunt.registerTask( 'compile', [
        'clean',
        'build',
        'ngAnnotate',
        'ngdocs',
        'concat:compile_js',
        'uglify',
        'index:compile'
    ]);
    /**
     * The default task is to build and compile.
     */
    grunt.registerTask( 'default', [ 'build', 'compile' ] );

};
