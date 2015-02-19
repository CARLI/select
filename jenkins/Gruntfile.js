var fs = require('fs');
var _ = require('lodash');
var localConfigFile = __dirname + '/../config/local.js';

module.exports = function (grunt) {
    grunt.registerTask('generate-config', generateConfig);

    function generateConfig(instance) {
        var cfg = {};

        if (instance === 'test') {
            cfg.alertTimeout = 1000;
        }

        cfg.storeOptions = generateCouchConfig(instance);
        cfg.middleware = generateMiddlewareConfig(instance);

        fs.writeFileSync(localConfigFile, stringifyConfig(cfg));

        function stringifyConfig(cfg) {
            return 'module.exports = ' + JSON.stringify(cfg, null, '    ') + ';';
        }
    }

    function generateCouchConfig(instance) {
        var storeOptions;

        if (instance == 'test') {
            storeOptions = getContainerCouchConfig();
        } else {
            storeOptions = getPublicCouchConfig(instance);
        }

        return storeOptions;

        function getContainerCouchConfig() {
            var host = process.env.COUCHDB_PORT_5984_TCP_ADDR;
            var port = process.env.COUCHDB_PORT_5984_TCP_PORT;

            if (host === undefined || port === undefined) {
                throw new Error('Couch container link not found');
            }

            return {
                couchDbUrl: 'http://' + host + ':' + port,
                couchDbName: 'carli'
            };
        }

        function getPublicCouchConfig() {
            return {
                couchDbUrl: getPublicCouchDbUrl(instance),
                couchDbName: 'carli'
            };

            //noinspection FunctionWithMultipleReturnPointsJS
            function getPublicCouchDbUrl() {
                switch (instance) {
                    case 'dev':
                        return 'http://carli-db.dev.pixotech.com';
                    case 'qa':
                        return 'http://carli-db.qa.pixotech.com';
                    default:
                        throw new Error('Invalid instance: ' + instance);
                }
            }
        }
    }

    function generateMiddlewareConfig(instance) {
        return {
            protocol: 'http',
            hostname: 'localhost',
            port: 3000
        };
    }
};
