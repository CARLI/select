var fs = require('fs');
var _ = require('lodash');
var defaultsConfigFile = __dirname + '/../CARLI/config/index.js';
var localConfigFile = __dirname + '/../CARLI/config/local.js';

module.exports = function (grunt) {
    grunt.registerTask('ensure-local-config', ensureLocalConfigExists);
    grunt.registerTask('generate-config', generateConfig);

    function ensureLocalConfigExists() {
        fs.closeSync(fs.openSync(localConfigFile, 'a'));
    }

    function generateConfig(instance) {
        ensureLocalConfigExists();

        if (instance === 'test') {
            var cfg = readLocalConfig();
            cfg.alertTimeout = 1000;
            fs.writeFileSync(localConfigFile, stringifyConfig(cfg));
        }

        generateCouchConfig(instance);
    }

    function generateCouchConfig(instance) {
        var cfg = readConfig();
        var localCfg = readLocalConfig();

        var storeOptions = localCfg.storeOptions || {};

        if (instance == 'test') {
            localCfg.storeOptions = _.extend(storeOptions, getContainerCouchConfig(cfg));
        } else {
            localCfg.storeOptions = _.extend(storeOptions, getPublicCouchConfig(instance, cfg));
        }

        fs.writeFileSync(localConfigFile, stringifyConfig(localCfg));
    }

    function readLocalConfig() {
        var cfg;
        try {
            var cfgString = fs.readFileSync(localConfigFile, { encoding: 'utf-8' });
            var startJson = cfgString.indexOf('{');
            var endJson = cfgString.lastIndexOf('}');
            if (startJson != -1 || endJson != -1) {
                cfgString = cfgString.substring(startJson, endJson + 1);
            }
            cfg = JSON.parse(cfgString);
        } catch (e) {
            cfg = {};
        }
        return cfg;
    }
    function readConfig() {
        var cfg, localCfg;
        var cfg = require(defaultsConfigFile);
        localCfg = readLocalConfig();
        return _.extend(cfg, localCfg);;
    }

    function stringifyConfig(cfg) {
        return 'module.exports = ' + JSON.stringify(cfg, null, '    ') + ';';
    }

    function getContainerCouchConfig(cfg) {
        var host = process.env.COUCHDB_PORT_5984_TCP_ADDR;
        var port = process.env.COUCHDB_PORT_5984_TCP_PORT;

        if (host === undefined || port === undefined) {
            throw new Error('Couch container link not found');
        }

        return _storeOptions('http://' + host + ':' + port, cfg.storeOptions.couchDbName);
    }

    function getPublicCouchConfig(instance, cfg) {
        if (instance === undefined) {
            instance = 'dev';
        }
        return _storeOptions(getPublicCouchDbUrlFor(instance), cfg.storeOptions.couchDbName);
    }

    function getPublicCouchDbUrlFor(instance) {
        switch (instance) {
            case 'dev':
                return 'http://carli-db.dev.pixotech.com';
            case 'qa':
                return 'http://carli-db.qa.pixotech.com';
            default:
                throw new Error('Invalid instance: ' + instance);
        }
    }

    function _storeOptions(url, dbName) {
        return {
            couchDbUrl: url,
            couchDbName: dbName
        };
    }
};
