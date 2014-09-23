// Karma configuration
// http://karma-runner.github.io/0.10/intro/configuration.html

module.exports = function(config) {
    config.set({

        basePath: '',

        frameworks: ['mocha', 'chai'],

        reporters: ['progress'],

        port: 9876,
        colors: true,
        autoWatch: false,
        singleRun: false,

        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        browsers: ['PhantomJS']
  });
};
