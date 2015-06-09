var config = require('../config');

module.exports = {
    local: {
        baseUrl: config.storeOptions.privilegedCouchDbUrl,
        mainDbName: config.storeOptions.couchDbName,
        mainDbUrl: config.storeOptions.privilegedCouchDbUrl + '/' + config.storeOptions.couchDbName
    },
    dev: {
        baseUrl: 'http://admin:relax@vmhost.i.pixotech.com:9091',
        mainDbName: 'carli',
        mainDbUrl: 'http://admin:relax@vmhost.i.pixotech.com:9091/carli'
    },
    qa: {
        baseUrl: 'http://docker1.i.pixotech.com:9081',
        mainDbName: 'carli',
        mainDbUrl: 'http://docker1.i.pixotech.com:9081/carli'
    },
    prod: {
        baseUrl: 'http://select-prod.carli.illinois.edu/db',
        mainDbName: 'carli',
        mainDbUrl: 'http://select-prod.carli.illinois.edu/db/carli'
    }
};
