var config = require('../config');

module.exports = {
    local: {
        baseUrl: config.storeOptions.couchDbUrl,
        mainDbName: config.storeOptions.couchDbName,
        mainDbUrl: config.storeOptions.couchDbUrl + '/' + config.storeOptions.couchDbName
    },
    dev: {
        baseUrl: 'http://carli-db.dev.pixotech.com',
        mainDbName: 'carli',
        mainDbUrl: 'http://carli-db.dev.pixotech.com/carli'
    },
    qa: {
        baseUrl: 'http://carli-db.qa.pixotech.com',
        mainDbName: 'carli',
        mainDbUrl: 'http://carli-db.qa.pixotech.com/carli'
    },
    prod: {
        baseUrl: 'http://select-prod.carli.illinois.edu/db',
        mainDbName: 'carli',
        mainDbUrl: 'http://select-prod.carli.illinois.edu/db/carli'
    }
};
