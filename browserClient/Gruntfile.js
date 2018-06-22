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
            },
            compile: {
                files: [
                    {
                        src: 'carliAppModule.js',
                        dest: user_config.browserify_file('carli')
                    },
                    {
                        src: 'libraryAppModule.js',
                        dest: user_config.browserify_file('library')
                    },
                    {
                        src: 'vendorAppModule.js',
                        dest: user_config.browserify_file('vendor')
                    }
                ]
            }
        },

        clean: {
            options: {
                force: true
            },
            build: [user_config.build_dir],
            compile: [user_config.compile_dir],
            compileCleanup: [
                user_config.processed_sass_file('carli'),
                user_config.processed_sass_file('library'),
                user_config.processed_sass_file('vendor'),
                user_config.browserify_file('carli'),
                user_config.browserify_file('library'),
                user_config.browserify_file('vendor'),
                user_config.annotated_js_file('carli'),
                user_config.annotated_js_file('library'),
                user_config.annotated_js_file('vendor'),
                user_config.annotated_iife_js_file('carli'),
                user_config.annotated_iife_js_file('library'),
                user_config.annotated_iife_js_file('vendor'),
                user_config.compile_dir + '/common/',
                user_config.common_components.annotated_js_file,
                user_config.common_components.annotated_iife_js_file
            ]
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
                            optBase.map(function(path){ return require('serve-static')(path); }));
                    }
                }
            },

            serveLibrary: {
                options: {
                    open: 'http://library.carli.local:8080',
                    port: 8002,
                    middleware: function (connect, options) {
                        var optBase = (typeof options.base === 'string') ? [options.base] : options.base;
                        var modRewrite = require('connect-modrewrite');

                        return [modRewrite(['!(\\..+)$ /libraryApp/index.html [L]'])].concat(
                            optBase.map(function(path){ return require('serve-static')(path); }));
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
                            optBase.map(function(path){ return require('serve-static')(path); }));
                    }
                }
            },

            serveCompiledCarli: {
                options: {
                    base: 'compile/',
                    open: 'http://staff.carli.local:8080',
                    port: 8000,
                    keepalive: true,
                    livereload: false,
                    middleware: function (connect, options) {
                        var optBase = (typeof options.base === 'string') ? [options.base] : options.base;
                        var modRewrite = require('connect-modrewrite');

                        return [modRewrite(['!(\\..+)$ /carliApp/index.html [L]'])].concat(
                            optBase.map(function(path){ return require('serve-static')(path); }));
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
                    },
                    {
                        src: user_config.bower_fonts,
                        dest: user_config.carli_app.build_dir + '/fonts/',
                        expand: true,
                        flatten: true
                    }
                ]
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
                    },
                    {
                        src: user_config.bower_fonts,
                        dest: user_config.library_app.build_dir + '/fonts/',
                        expand: true,
                        flatten: true
                    }
                ]
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
                files: [
                    {
                        src: user_config.bower_files,
                        dest: user_config.vendor_app.build_dir
                    },
                    {
                        src: user_config.bower_fonts,
                        dest: user_config.vendor_app.build_dir + '/fonts/',
                        expand: true,
                        flatten: true
                    }
                ]
            },

            compile: {
                //non-JS files
                files: [
                    {
                        src: user_config.carli_app.all_web_files,
                        dest: user_config.compile_dir,
                        expand: true
                    },
                    {
                        src: user_config.library_app.all_web_files,
                        dest: user_config.compile_dir,
                        expand: true
                    },
                    {
                        src: user_config.vendor_app.all_web_files,
                        dest: user_config.compile_dir,
                        expand: true
                    },
                    //favicons
                    {
                        src: user_config.common_components.favicons,
                        dest: user_config.carli_app.compile_dir
                    },
                    {
                        src: user_config.common_components.favicons,
                        dest: user_config.library_app.compile_dir
                    },
                    {
                        src: user_config.common_components.favicons,
                        dest: user_config.vendor_app.compile_dir
                    },
                    //fonts
                    {
                        src: user_config.bower_fonts,
                        dest: user_config.carli_app.compile_dir + '/fonts/',
                        expand: true,
                        flatten: true
                    },
                    {
                        src: user_config.bower_fonts,
                        dest: user_config.library_app.compile_dir + '/fonts/',
                        expand: true,
                        flatten: true
                    },
                    {
                        src: user_config.bower_fonts,
                        dest: user_config.vendor_app.compile_dir + '/fonts/',
                        expand: true,
                        flatten: true
                    }
                ]
            }
        },

        cssmin: {
            compile: {
                files: [
                    {
                        src: [user_config.processed_sass_file('carli'), user_config.bower_css],
                        dest: user_config.compiled_css_file('carli')
                    },
                    {
                        src: [user_config.processed_sass_file('library'), user_config.bower_css],
                        dest: user_config.compiled_css_file('library')
                    },
                    {
                        src: [user_config.processed_sass_file('vendor'), user_config.bower_css],
                        dest: user_config.compiled_css_file('vendor')
                    }
                ]
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
            }
        },

        indexCompile: {
            carli: {
                options: {
                    base: 'carli'
                }
            },

            library: {
                options: {
                    base: 'library'
                }
            },

            vendor: {
                options: {
                    base: 'vendor'
                }
            }
        },

        ngAnnotate: {
            common: {
                src: user_config.common_components.all_js,
                dest: user_config.common_components.annotated_js_file
            },
            carli: {
                src: user_config.carli_app.all_js,
                dest: user_config.annotated_js_file('carli')
            },
            library: {
                src: user_config.library_app.all_js,
                dest: user_config.annotated_js_file('library')
            },
            vendor: {
                src: user_config.vendor_app.all_js,
                dest: user_config.annotated_js_file('vendor')
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
                src: user_config.carli_app.all_js,
                title: 'API Documentation'
            }
        },

        sass: {
            options: {
                sourceMap: true
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
            },

            compile: {
                options: {
                    sourceMap: false
                },
                files: [
                    {
                        src: user_config.carli_app.sass_main,
                        dest: user_config.processed_sass_file('carli'),
                        ext: '.css',
                        flatten: true
                    },
                    {
                        src: user_config.library_app.sass_main,
                        dest: user_config.processed_sass_file('library'),
                        ext: '.css',
                        flatten: true
                    },
                    {
                        src: user_config.vendor_app.sass_main,
                        dest: user_config.processed_sass_file('vendor'),
                        ext: '.css',
                        flatten: true
                    }
                ]
            }
        },

        uglify: {
            compile: {
                options: {
                    compress: false,
                    mangle: false
                },
                files: [
                    {
                        src: [
                            user_config.bower_js,
                            user_config.browserify_file('carli'),
                            user_config.common_components.annotated_iife_js_file,
                            user_config.annotated_iife_js_file('carli')
                        ],
                        dest: user_config.compiled_js_file('carli')
                    },
                    {
                        src: [
                            user_config.bower_js,
                            user_config.browserify_file('library'),
                            user_config.common_components.annotated_iife_js_file,
                            user_config.annotated_iife_js_file('library')
                        ],
                        dest: user_config.compiled_js_file('library')
                    },
                    {
                        src: [
                            user_config.bower_js,
                            user_config.browserify_file('vendor'),
                            user_config.common_components.annotated_iife_js_file,
                            user_config.annotated_iife_js_file('vendor')
                        ],
                        dest: user_config.compiled_js_file('vendor')
                    }
                ]
            },
            wrapInIIFE: {
                options: {
                    compress: false,
                    mangle: false,
                    banner: '(function ( window, angular, undefined ) {',
                    footer: '})( window, window.angular );'
                },
                files: [
                    {
                        src: [user_config.common_components.annotated_js_file],
                        dest: user_config.common_components.annotated_iife_js_file
                    },
                    {
                        src: [user_config.annotated_js_file('carli')],
                        dest: user_config.annotated_iife_js_file('carli')
                    },
                    {
                        src: [user_config.annotated_js_file('library')],
                        dest: user_config.annotated_iife_js_file('library')
                    },
                    {
                        src: [user_config.annotated_js_file('vendor')],
                        dest: user_config.annotated_iife_js_file('vendor')
                    }
                ]
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
                        styles: cssFiles,
                        appCss: options.base + '/app.css',
                        prdModeStrictDi: ''
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

    grunt.registerMultiTask( 'indexCompile', 'Process index.html template using compiled js and css', function () {
        var options = this.options();
        var app = options.base;

        var indexFile = app + 'App/index.html';
        var targetIndexFile = user_config.compiled_index_file(app);

        var compiled_js = user_config.compiled_js_file(app).replace(user_config.compile_dir+'/', '');
        var complied_css = user_config.compiled_css_file(app).replace(user_config.compile_dir+'/', '');

        grunt.file.copy(indexFile, targetIndexFile, {
            process: function( contents, path ) {
                return grunt.template.process( contents, {
                    data: {
                        scripts: [compiled_js],
                        styles: [],
                        appCss: complied_css,
                        prdModeStrictDi: ''
                        //prdModeStrictDi: 'ng-strict-di'
                    }
                });
            }
        });
    });

    grunt.registerTask( 'build', [
        'clean:build',
        'build:carli',
        'build:library',
        'build:vendor'
    ]);

    grunt.registerTask( 'build:carli', [
        'jsenv:browser',
        'ensure-local-config',
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
        'browserify:vendor',
        'copy:vendor_app_common_components',
        'copy:vendor_app_all_files',
        'copy:vendor_app_bower_files',
        'sass:vendor',
        'index:vendor',
        'jsenv:node'
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

    grunt.registerTask( 'serveCompiled', [
        'compile',
        'connect:serveCompiledCarli'
    ]);

    grunt.registerTask( 'browserifyCompile', [
        'jsenv:browser',
        'browserify:compile',
        'jsenv:node'
    ]);

    /**
     * The `compile` task gets your app ready for deployment by concatenating and
     * minifying your code.
     */
    grunt.registerTask( 'compile', [
        'clean:compile',
        'copy:compile',
        'sass:compile',
        'cssmin:compile',
        'browserifyCompile',
        'ngAnnotate',
        'uglify:wrapInIIFE',
        'uglify:compile',
        'indexCompile',
        'clean:compileCleanup'
    ]);

    /**
     * The default task is to build and compile.
     */
    grunt.registerTask( 'default', [ 'build', 'compile' ] );

};
