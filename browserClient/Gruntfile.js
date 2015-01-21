module.exports = function ( grunt ) {

    var _ = require('lodash');

    /** 
     * Load required Grunt tasks. These are installed based on the versions listed
     * in `package.json` when you do `npm install` in this directory.
     *
     * load-grunt-tasks parses package.json and loads everything matching 'grunt-*'
     */
    require('load-grunt-tasks')(grunt);
    require('../grunt/jsenv')(grunt);
    require('../grunt/subdir')(grunt);
    require('../grunt/db')(grunt);

    /**
     * Load in our build configuration file.
     */
    var userConfig = require( './build.config.js' );

    /**
     * This is the configuration object Grunt uses to give each plugin its 
     * instructions.
     */
    var taskConfig = {

        /**
         * We read in our `package.json` file so we can access the package name and
         * version. It's already there, so we don't repeat ourselves here.
         */
        pkg: grunt.file.readJSON("package.json"),


        browserify: {
            build: {
                files: [{
                    src: ['<%= logic_files.js %>'],
                    dest: '<%= build_dir %>/<%= logic_files.build %>'
                }],
            
                options: {
                    browserifyOptions: {
                        standalone: '<%= logic_files.global_var %>',
                        debug: true
                    }
                }
            },

            /* TODO: make the 'compile' task use this target to skip building maps */
            compile: {
                files: [{
                    src: ['<%= logic_files.js %>'],
                    dest: '<%= build_dir %>/<%= logic_files.build %>'
                }],

                options: {
                    browserifyOptions: {
                        standalone: '<%= logic_files.global_var %>'
                    }
                }
            }
        },

        /**
         * The directories to delete when `grunt clean` is executed.
         */
        clean: [
          '<%= build_dir %>',
          '<%= compile_dir %>'
        ],

        /**
         * The `copy` task just copies files from A to B. We use it here to copy
         * our project and vendor JavaScript into `build_dir`.
         */
        copy: {
            build_appjs: {
                files: [{
                    src: [ '<%= carliApp_files.js %>' ],
                    dest: '<%= build_dir %>/',
                    expand: true
              }]
            },
            build_vendorjs: {
                files: [{
                    src: [ '<%= vendor_files.js %>' ],
                    dest: '<%= build_dir %>/',
                    expand: true
                }]
            },
            build_vendorfonts: {
                files: [{
                    src: [ '<%= vendor_files.fonts %>' ],
                    dest: '<%= build_dir %>/fonts',
                    expand: true,
                    flatten: true
                }]
            },
            build_html: {
                files: [{
                    src: ['<%= carliApp_files.html %>'],
                    dest: '<%= build_dir %>/',
                    expand: true
                }]
            },
            build_images: {
                files: [{
                    src: [ '<%= carliApp_files.images %>' ],
                    dest: '<%= build_dir %>/images',
                    expand: true,
                    flatten: true
                }]
            },
            build_json: {
                files: [{
                    src: ['<%= carliApp_files.json %>'],
                    dest: '<%= build_dir %>/',
                    expand: true
                }]
            },
            build_helper_scripts: {
                files: [{
                    src: ['<%= carliApp_files.helper_scripts %>'],
                    dest: '<%= build_dir %>/',
                    expand: true
                }]
            }
        },


        /**
         * `grunt concat` concatenates multiple source files into a single file.
         */
        concat: {
            /**
             * The `compile_js` target is the concatenation of our application source
             * code and all specified vendor source code into a single file.
             */
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
                base: 'build',
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

        /**
         * `jshint` defines the rules of our linter as well as which files we
         * should check. This file, all javascript sources, and all our unit tests
         * are linted based on the policies listed in `options`. But we can also
         * specify exclusionary patterns by prefixing them with an exclamation
         * point (!); this is useful when code comes from a third party but is
         * nonetheless inside `src/`.
         */
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

        /**
         * Annotates the sources before minifying. That is, it allows us
         * to code without the array syntax.
         */
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

        /**
         * Generate docs for our Angular components
         */
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

        /**
         * Minify the sources!
         */
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
        },

        /**
         * The `index` task compiles the `index.html` file as a Grunt template. CSS
         * and JS files co-exist here but they get split apart later.
         */
        index: {

            /**
             * During development, we don't want to have wait for compilation,
             * concatenation, minification, etc. So to avoid these steps, we simply
             * add all script files directly to the `<body>` of `index.html`. The
             * `src` property contains the list of included files.
             */
            build: {
                dir: '<%= build_dir %>',
                src: [
                    '<%= vendor_files.js %>',
                    '<%= build_dir %>/<%= logic_files.build %>',
                    '<%= build_dir %>/<%= carliApp_files.jsAll %>',
                    '<%= build_dir %>/<%= carliApp_files.helper_scripts %>',
                    '<%= build_dir %>/css/*.css',
                    '!<%= build_dir %>/css/app.css'
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
        }
    };

    grunt.initConfig( _.extend( taskConfig, userConfig ) );

    /**
     * A utility function to get all app JavaScript sources.
     */
    function filterForJS ( files ) {
        return files.filter( function ( file ) {
            return file.match( /\.js$/ );
        });
    }

    /**
     * A utility function to get all app CSS sources.
     */
    function filterForCSS ( files ) {
        return files.filter( function ( file ) {
            return file.match( /\.css$/ );
        });
    }

    /** 
     * The index.html template includes the stylesheet and javascript sources
     * based on dynamic names calculated in this Gruntfile. This task assembles
     * the list into variables for the template to use and then runs the
     * compilation.
     */
    grunt.registerMultiTask( 'index', 'Process index.html template', function () {
        var options = this.options();

        var dirRE = new RegExp( '^('+grunt.config('build_dir')+'|'+grunt.config('compile_dir')+')\/', 'g' );

        var jsFiles = filterForJS( this.filesSrc ).map( function ( file ) {
            return file.replace( dirRE, '' );
        });
        var cssFiles = filterForCSS( this.filesSrc ).map( function ( file ) {
            return file.replace( dirRE, '' );
        });

        grunt.file.copy('carliApp/index.html', this.data.dir + '/index.html', {
            process: function ( contents, path ) {
                return grunt.template.process( contents, {
                    data: {
                        scripts: jsFiles,
                        styles: cssFiles,
                        version: grunt.config( 'pkg.version' )
                    }
                });
            }
        });
    });

    /**
     * The `build` task gets your app ready to run for development and testing.
     */
    grunt.registerTask( 'build', [
        'clean',
        'jsenv:browser',
        'subdir-grunt:../CARLI:ensure-local-config',
        'newer:jshint',
        'newer:copy:build_appjs', 
        'newer:copy:build_vendorjs',
        'newer:copy:build_vendorfonts',
        'newer:copy:build_images',
        'newer:copy:build_html',
        'newer:copy:build_json',
        'newer:copy:build_helper_scripts',
        'browserify:build',
        'sass:build',
        'index:build',
        'jsenv:node'
    ]);

    /**
     * Use `grunt test` to run ALL tests once
     */
    grunt.registerTask( 'test', [
        'test:unit'
        , 'test:e2e'
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
            'deploy-db',
            'protractor'
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
        'test:unit'
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
