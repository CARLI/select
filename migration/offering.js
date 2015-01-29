var Q = require('q');

function migrateOfferings(connection, cycle, libraryIdMapping, productIdMapping){
    var resultsPromise = Q.defer();
    console.log('===== migrate offerings for ' + cycle.name );

    resultsPromise.resolve({});

    return resultsPromise.promise;
}

module.exports = {
    migrateOfferings: migrateOfferings
};