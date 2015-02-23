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
        cfg.memberDb = generateMemberDbConfig(instance);

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
            var host = process.env.CARLI_COUCHDB_PORT_5984_TCP_ADDR;
            var port = process.env.CARLI_COUCHDB_PORT_5984_TCP_PORT;

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
                        return 'http://carli.dev.pixotech.com/db';
                    case 'qa':
                        return 'http://carli.qa.pixotech.com/db';
                    default:
                        throw new Error('Invalid instance: ' + instance);
                }
            }
        }
    }

    function generateMiddlewareConfig(instance) {
        return {
            url: getPublicMiddlewareUrl()
        };

        //noinspection FunctionWithMultipleReturnPointsJS
        function getPublicMiddlewareUrl() {
            switch (instance) {
                case 'test':
                    return 'http://carli-middleware/';
                case 'dev':
                    return 'http://carli.dev.pixotech.com/api';
                case 'qa':
                    return 'http://carli.qa.pixotech.com/api';
                default:
                    throw new Error('Invalid instance: ' + instance);
            }
        }
    }

    function generateMemberDbConfig(instance) {
        return {
            host: 'mysql.carli.illinois.edu',
            user: 'guest_pixo',
            password: process.env.CARLI_CRM_MYSQL_PASSWORD,
            database: 'carli_crm'
        };
    }
};
