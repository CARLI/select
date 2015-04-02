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

        build: {
            carli: {

            },
            vendor: {
                
            }
        },

        clean: [
          '<%= build_dir %>',
          '<%= compile_dir %>'
        ],

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
                port: 8000,
                base: 'build/',
                livereload: 35729,
                middleware: function (connect, options) {
                    var optBase = (typeof options.base === 'string') ? [options.base] : options.base;
                    return [require('connect-modrewrite')(['!(\\..+)$ / [L]'])].concat(
                        optBase.map(function(path){ return connect.static(path); }));
                }
            },

            serve: {
                options: {
                    open: true
                }
            },

            serveHeadless: {
                options: {
                    open: false,
                    livereload: false
                }
            },

            tests: {
                options: {
                    open: false,
                    livereload: false
                }
            }

        },

        copy: {
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
            },
            build_html: {
                files: [{
                    src: ['<%= carliApp_files.html %>'],
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
                dir: user_config.carli_app.build_dir,
                src: [
                    'build/carliApp/CARLI.js',
                    user_config.bower_files,
                    user_config.carli_app.all_js
                ]
            },

            vendor: {
                options: {
                    base: 'vendorApp'
                },
                dir: user_config.vendor_app.build_dir,
                src: [
                    user_config.bower_files,
                    user_config.logic_files.build,
                    user_config.vendor_app.all_js
                ]
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
                '<%= carliApp_files.js %>'
            ],
            test: [
                '<%= carliApp_files.jsUnit %>',
                '<%= carliApp_files.jsE2e %>'
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

        protractor_webdriver: {
            options: {},
            all: {}
        },

        protractor: {
            options: {
                configFile: "protractor.conf.js",
                keepAlive: false,
                noColor: false,
                args: {}
            },
            all: {}
        },

        sass: {
            options: {
                loadPath: '.'
            },
            build: {
                files: [{
                    src: ['<%= carliApp_files.scss %>', '<%= vendor_files.css %>'],
                    dest: '<%= build_dir %>/css/',
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

            /* */
            gruntfile: {
                files: 'Gruntfile.js',
                tasks: ['jshint:gruntfile'],
                options: {                
                    livereload: false
                }
            },

           /**
            * When our JavaScript source files change, we want to run lint them and
            * run our unit tests.
            */
            jssrc: {
                files: ['<%= carliApp_files.js %>'],
                tasks: [ 'newer:jshint:src', 'newer:copy:build_appjs' ]
            },

           /**
            * If JavaScript files are added or removed, process index.html to update the loaded scripts.
            */
            jssrcfiles: {
                files: ['<%= carliApp_files.js %>'],
                tasks: [ 'newer:copy:build_appjs', 'index:build' ], 
                options: {
                    event: ['added', 'deleted']
                }
            },

           /**
            * When index.html changes, we need to compile it.
            */
            index: {
                files: [ '<%= carliApp_files.index %>' ],
                tasks: [ 'index:build' ]
            },

           /**
            * When a JavaScript unit test file changes, we only want to lint it and
            * run the unit tests. We don't want to do any live reloading.
            */
            jsunit: {
                files: ['<%= carliApp_files.jsUnit %>'],
                tasks: [ 'newer:jshint:test', 'karma:unit:run' ],
                options: {
                    livereload: false
                }
            },

            /**
             *
             */
            html: {
                files: ['<%= carliApp_files.html %>'],
                tasks: ['newer:copy:build_html']
            },

            css: {
                files: ['<%= carliApp_files.watchSass %>'],
                tasks: ['sass:build']
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

        var basePathRegExp = new RegExp('^('+ user_config.build_dir + ')\/', 'g');

        var normalizedFiles = this.filesSrc.map(stripBuildBasePath).map(addAppBasePath);
        var jsFiles = normalizedFiles.filter(jsFilesOnly);

        var cssFiles = normalizedFiles.filter(cssFilesOnly);

        grunt.file.copy(indexFile, this.data.dir + '/index.html', {
            process: function( contents, path ) {
                return grunt.template.process( contents, {
                    data: {
                        scripts: jsFiles,
                        styles: cssFiles,
                        version: grunt.config( 'pkg.version' )
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

    /**
     * The `build` task gets your app ready to run for development and testing.
     */
    grunt.registerTask( 'build', [
        'clean',
        'jsenv:browser',
        'ensure-local-config',
        'jshint',

        'browserify:carli',
        'copy:carli_app_all_files',
        'copy:carli_app_bower_files',
        'sass:build', /* carli */
        'index:carli',

        'jsenv:node'
    ]);


    grunt.registerTask('buildVendorApp', [
        'clean',
        'jsenv:browser',
        'ensure-local-config',
        'jshint',

        'browserify:vendor',
        'copy:vendor_app_all_files',
        'copy:vendor_app_bower_files',
        'sass:build',  /* vendor */
        'index:vendor',

        'jsenv:node'
    ]);


    /**
     * Use `grunt test` to run ALL tests once
     */
    grunt.registerTask( 'test', [
        'test:unit'
        //'test:e2e'
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

    grunt.registerTask( 'test:e2e', 'Run the end-to-end tests', function(){
        if ( this.args && this.args.length > 0 ){
            var specFiles = this.args.map( function(name){
                return 'e2e/' + name + '.spec.js';
            });
            grunt.config('protractor.options.args.specs', specFiles);
        }

        grunt.task.run([
            'clean',
            'build',
            'protractor_webdriver',
            'connect:tests',
            // 'deploy-test-db',
            'protractor'// ,
            // 'delete-test-dbs'
        ]);
    });

    grunt.registerTask( 'test:e2eJenkins', [
        'clean',
        'build',
        'connect:tests',
        'deploy-db',
        'protractor'
    ]);

    grunt.registerTask( 'test:jenkins', [
        'test:unit',
        //, 'test:e2eJenkins'
    ]);

    /*
     * The `serve` task is used during development to preview the app and live reload 
     */
    grunt.registerTask( 'serve', [
        'build',
        'karma:unit',
        'connect:serve',
        'watch'
    ]);
    /*
     * The `serve:headless` task runs serve without opening the browser, and without livereload
     */
    grunt.registerTask( 'serve:headless', [
        'build',
        'connect:serveHeadless',
        // Leave `watch` here -- otherwise the server just exits immediately
        'watch'
    ]);

    /*
     * The `serve:protractor` task is used to start the selenium server along with a dev server to run Protractor tests
     * against. (Use this if you want to manually run Protractor).
     */
    grunt.registerTask( 'serve:protractor', [
        'build',
        'karma:unit',
        'protractor_webdriver',
        'connect:serve',
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
