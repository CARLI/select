var config = require('../config');

module.exports = {
    local: {
        baseUrl: config.storeOptions.privilegedCouchDbUrl,
        publicBaseUrl: config.storeOptions.couchDbUrl,
        mainDbName: config.storeOptions.couchDbName,
        mainDbUrl: config.storeOptions.privilegedCouchDbUrl + '/' + config.storeOptions.couchDbName
    },
    dev: {
        baseUrl: 'http://admin:relax@vmhost.i.pixotech.com:9091',
        publicBaseUrl: 'http://carli.dev.pixotech.com/db',
        mainDbName: 'carli',
        mainDbUrl: 'http://admin:relax@vmhost.i.pixotech.com:9091/carli'
    },
    qa: {
        baseUrl: 'http://admin:relax@docker1.i.pixotech.com:9081',
        publicBaseUrl: 'http://carli.qa.pixotech.com/db',
        mainDbName: 'carli',
        mainDbUrl: 'http://admin:relax@docker1.i.pixotech.com:9081/carli'
    },
    prod: {
        baseUrl: 'http://select-prod.carli.illinois.edu/db',
        publicBaseUrl: 'http://select-prod.carli.illinois.edu/db/carli',
        mainDbName: 'carli',
        mainDbUrl: 'http://select-prod.carli.illinois.edu/db/carli'
    }
};
