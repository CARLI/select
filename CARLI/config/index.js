module.exports = {
    storeOptions: {
        couchDbUrl: 'http://localhost:5984',
        couchDbName: 'testy',
    },
    request: require('../carliRequest'),
    store: 'CouchDbStore'
};
