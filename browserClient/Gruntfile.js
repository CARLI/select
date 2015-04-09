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
                    src: user_config.logic_files.js,
                    dest: user_config.carli_app.build_dir + user_config.logic_files.build
                }]
            },
            vendor: {
                files: [{
                    src: user_config.logic_files.js,
                    dest: user_config.vendor_app.build_dir + user_config.logic_files.build
                }]
            }
        },

        clean: [ user_config.build_dir, user_config.compile_dir ],

        concat: {
            compile_js: {
                src: [
                    '<%= vendor_files.js %>',
                    '<%= build_dir %>/<%= logic_files.build %>',
                    'module.prefix',
                    '<%= build_dir %>/<%= carliApp_files.jsAll %>',
                    'module.suffix'
                ],
                dest: '<%= compile_dir %>/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },

        connect: {
            options: {
                hostname: '0.0.0.0',
                base: 'build/',
                livereload: 35729
            },

            serveCarli: {
                options: {
                    open: true,
                    port: 8000,
                    middleware: function (connect, options) {
                        var optBase = (typeof options.base === 'string') ? [options.base] : options.base;
                        var modRewrite = require('connect-modrewrite');

                        return [modRewrite(['!(\\..+)$ /carliApp/index.html [L]'])].concat(
                            optBase.map(function(path){ return connect.static(path); }));
                    }
                }
            },

            serveVendor: {
                options: {
                    open: true,
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
            },



            build_appjs: {
                files: [{
                    src: [ '<%= carliApp_files.js %>' ],
                    dest: '<%= build_dir %>/',
                    expand: true
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
                dir: '<%= compile_dir %>',
                src: [
                    '<%= concat.compile_js.dest %>',
                    '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
                ]
            }
        },

        jshint: {
            src: [
                user_config.logic_files.js,
                user_config.carli_app.all_js,
                user_config.vendor_app.all_js
            ],
            test: [
                user_config.carli_app.test_js,
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
                configFile: 'karma.conf.js',
                files: [
                    '<%= vendor_files.js %>',
                    '<%= test_files.js %>',
                    '<%= build_dir %>/*.js',
                    '<%= build_dir %>/<%= carliApp_files.jsAll %>',
                    '<%= carliApp_files.jsUnit %>'
                ]
            },
            /**
             * 'grunt serve' includes 'karma:unit' which starts up the background karma server.
             * 'karma:unit:run' runs the tests against the already-running server, which is quite 
             * a bit faster than 'karma:continuous'. 
             * The 'watch' tasks run 'karma:unit:run' whenever test files change.
             */
            unit: {
                singleRun: false,
                background: true,
                reporters: ['mocha']
            },
            continuous: {
                singleRun: true,
                browsers: [ 'PhantomJS' ],
                reporters: [ 'mocha', 'junit' ],
                junitReporter: {
                    outputFile: '../artifacts/test-results/browserClient-unit.xml'
                }
            },
            configTemplate: {
                basePath: '.',
                frameworks: ['mocha', 'chai'],
                reporters: ['progress'],
                port: 9876,
                colors: true,
                autoWatch: false,
                singleRun: false,
                browsers: ['PhantomJS']
            }
        },

        ngAnnotate: {
            compile: {
                files: [{
                    src: [ '<%= carliApp_files.js %>' ],
                    cwd: '<%= build_dir %>',
                    dest: '<%= build_dir %>',
                    expand: true
                }]
            }
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
                src: '<%= carliApp_files.js %>', 
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
            compile: {
                files: {'<%= concat.compile_js.dest %>': '<%= concat.compile_js.dest %>' }
            }
        },

        watch: {
            options: {
                livereload: true
            },

            filesChangedCarli: {
                files: user_config.carli_app.all_files,
                tasks: ['newer:copy:carli_app_all_files', 'index:carli']
            },

            filesChangedVendor: {
                files: user_config.vendor_app.all_files,
                tasks: ['newer:copy:vendor_app_all_files', 'index:vendor']
            },

            sassCarli: {
                files: user_config.carli_app.sass_all,
                tasks: ['sass:carli']
            },

            sassVendor: {
                files: user_config.vendor_app.sass_all,
                tasks: ['sass:vendor']
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
        'generate-karmaconf',
        'build',
        'karma:continuous'
    ]);

    grunt.registerTask( 'test:jenkins', [
        'test:unit'
    ]);

    /*
     * The `serve` task is used during development to preview the app and live reload 
     */
    grunt.registerTask( 'serve', [
        'build',
        'karma:unit',
        'connect:serveCarli',
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
     * Generate a karma.conf.js file suitable for running Karma tests standalone.
     */
    grunt.registerTask( 'generate-karmaconf', 'Generate Karma configuration for executing tests outside of Grunt', function () {
        var config = grunt.config('karma.configTemplate');
        // Flatten the files array into a single 1-dimensional array
        config.files = grunt.config('karma.options.files').reduce(function(a, b) {
              return a.concat(b);
        });
        var configString = 'module.exports = function(config) { config.set(' + JSON.stringify(config, null, '    ') + '); };';
        grunt.file.write(grunt.config('karma.options.configFile'), configString);
    });

    /**
     * The default task is to build and compile.
     */
    grunt.registerTask( 'default', [ 'build', 'compile' ] );

};
