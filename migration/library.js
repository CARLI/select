var LibraryRepository = require('../CARLI').Library;
var CouchDbStore = require('../CARLI').CouchDbStore;
var carliConfig = require('../CARLI').config;
var StoreOptions = carliConfig.storeOptions;
var Store = require('../CARLI').Store;
var Q = require('q');
LibraryRepository.setStore(Store(CouchDbStore(StoreOptions)));


function migrateLibraries(connection) {
    var resultsPromise = Q.defer();

    var query = "select id, name from library";
    connection.query(query, function(err, rows, fields) {
        if(err) { console.log(err); }

        extractLibraries(rows).then(function(idMap){
            resultsPromise.resolve(idMap);
        });
    });

    return resultsPromise.promise;
}

function extractLibraries(libraries) {
    var idalIdsToCouchIds = {};
    var extractPromises = [];
    var resultsPromise = Q.defer();

    for (var i in libraries) {
        var createLibraryPromise = createLibrary(libraries[i]);

        extractPromises.push(createLibraryPromise);

        createLibraryPromise.then(function(resultObj){
            idalIdsToCouchIds[resultObj.idalLegacyId] = resultObj.couchId;
        });
    }

    Q.all(extractPromises).then(function(){
        resultsPromise.resolve(idalIdsToCouchIds);
    });

    return resultsPromise.promise;
}

function createLibrary(libraryRow){
    //console.log('  creating library: ' + libraryRow.name);

    var couchIdPromise = Q.defer();
    var library = extractLibrary(libraryRow);

    LibraryRepository.create( library )
        .then(function(id) {
            couchIdPromise.resolve({
                couchId: id,
                idalLegacyId: libraryRow.id
            });
        })
        .catch(function(err) {
            console.log(err);
            couchIdPromise.reject();
        });

    return couchIdPromise.promise;
}

function extractLibrary(row) {
    return {
        name: row.name,
        isActive: true
    };
}

module.exports = {
    migrateLibraries: migrateLibraries
};
