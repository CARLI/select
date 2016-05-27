var fs = require('fs');
var _ = require('lodash');
var dbInfo = require('../db/databaseInfo');
var localConfigFile = __dirname + '/../config/local.json';


module.exports = function (grunt) {
    grunt.registerTask('generate-config', generateConfig);

    function generateConfig(instance) {
        var cfg = {};

        if (instance === 'test') {
            cfg.alertTimeout = 1000;
        }

        cfg.memberDb = generateMemberDbConfig(instance);

        fs.writeFileSync(localConfigFile, stringifyConfig(cfg));

        function stringifyConfig(cfg) {
            return 'module.exports = ' + JSON.stringify(cfg, null, '    ') + ';';
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
};
