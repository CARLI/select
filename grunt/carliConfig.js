var fs = require('fs');
var _ = require('lodash');
var localConfigFile = __dirname + '/../CARLI/config/local.js';

module.exports = function (grunt) {
    grunt.registerTask('ensure-local-config', ensureLocalConfigExists);
    grunt.registerTask('generate-couch-config', generateCouchConfig);

    function ensureLocalConfigExists() {
        fs.closeSync(fs.openSync(localConfigFile, 'a'));
    }

    function generateCouchConfig(instance) {
        var cfg = readExistingConfig();
        var storeOptions = cfg.storeOptions || {};

        if (instance == 'test') {
            cfg.storeOptions = _.extend(storeOptions, getContainerCouchConfig());
        } else {
            cfg.storeOptions = _.extend(storeOptions, getPublicCouchConfig(instance));
        }

        fs.writeFileSync(localConfigFile, stringifyConfig(cfg));
    }

    function readExistingConfig() {
        var cfg;
        try {
            var cfgString = fs.readFileSync(localConfigFile, { encoding: 'utf-8' });
            cfg = JSON.parse(cfgString);
        } catch (e) {
            cfg = {};
        }
        return cfg;
    }

    function stringifyConfig(cfg) {
        return 'module.exports = ' + JSON.stringify(cfg, null, '    ') + ';';
    }

    function getContainerCouchConfig() {
        var host = process.env.COUCHDB_PORT_5984_TCP_ADDR;
        var port = process.env.COUCHDB_PORT_5984_TCP_PORT;

        if (host === undefined || port === undefined) {
            throw new Error('Couch container link not found');
        }

        return _storeOptions('http://' + host + ':' + port, 'testy');
    }

    function getPublicCouchConfig(instance) {
        if (instance === undefined) {
            instance = 'dev';
        }
        return _storeOptions(getPublicCouchDbUrlFor(instance), 'testy');
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