var fs = require('fs');
var _ = require('lodash');
var dbInfo = require('../db/databaseInfo');
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
        cfg.cookieDomain = getCookieDomain(instance);

        fs.writeFileSync(localConfigFile, stringifyConfig(cfg));

        function stringifyConfig(cfg) {
            return 'module.exports = ' + JSON.stringify(cfg, null, '    ') + ';';
        }
    }

    function generateCouchConfig(instance) {
        var storeOptions;

        if (instance == 'test') {
            storeOptions = getContainerCouchConfig(instance);
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

            //var password = process.env.CARLI_COUCHDB_ADMIN_PASSWORD || 'relax';

            return {
                privilegedCouchDbUrl: 'http://admin:relax@' + host + ':' + port,
                couchDbUrl: 'http://' + host + ':' + port,
                couchDbName: 'carli'
            };
        }

        function getPublicCouchConfig() {
            return {
                privilegedCouchDbUrl: getPrivilegedCouchDbUrl(instance),
                couchDbUrl: getPublicCouchDbUrl(instance),
                couchDbName: 'carli'
            };

            //noinspection FunctionWithMultipleReturnPointsJS
            function getPrivilegedCouchDbUrl() {
                switch (instance) {
                    case 'dev':
                    case 'qa':
                    case 'prod':
                        var containerConfig = getContainerCouchConfig();
                        return containerConfig.privilegedCouchDbUrl;
                    default:
                        throw new Error('Invalid instance: ' + instance);
                }
            }
            //noinspection FunctionWithMultipleReturnPointsJS
            function getPublicCouchDbUrl() {
                switch (instance) {
                    case 'dev':
                        return dbInfo.dev.publicBaseUrl;
                    case 'qa':
                        return dbInfo.qa.publicBaseUrl;
                    case 'prod':
                        return dbInfo.prod.publicBaseUrl;
                    default:
                        throw new Error('Invalid instance: ' + instance);
                }
            }
        }
    }

    function generateMiddlewareConfig(instance) {
        return {
            url: getPublicMiddlewareUrl(),
            port: 3000
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
                case 'prod':
                    return 'http://select-prod.carli.illinois.edu/api';
                default:
                    throw new Error('Invalid instance: ' + instance);
            }
        }
    }

    function generateMemberDbConfig(instance) {
        return {
            connectionLimit: 10,
            host: 'mysql.carli.illinois.edu',
            user: 'guest_pixo',
            password: process.env.CARLI_CRM_MYSQL_PASSWORD,
            database: 'carli_crm'
        };
    }

    function getCookieDomain(instance) {
        //noinspection FunctionWithMultipleReturnPointsJS
        switch (instance) {
            case 'test':
                return 'carli.local';
            case 'dev':
                return 'dev.pixotech.com';
            case 'qa':
                return 'qa.pixotech.com';
            case 'prod':
                return 'carli.illinois.edu';
            default:
                throw new Error('Invalid instance: ' + instance);
        }
    }
};
