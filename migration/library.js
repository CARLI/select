var LibraryRepository = require('../CARLI').Library;
var CouchDbStore = require('../CARLI').CouchDbStore;
var carliConfig = require('../CARLI').config;
var StoreOptions = carliConfig.storeOptions;
var Store = require('../CARLI').Store;
var Q = require('q');
var staticIdalToCrmMap = require('./config/staticIdalToCrmMap');
var idalBlacklist = require('./config/idalBlacklist');

LibraryRepository.setStore(Store(CouchDbStore(StoreOptions)));

function migrateLibraries(connection, crmLibraryMapping) {
    var resultsPromise = Q.defer();

    var query = "select id, name from library";
    connection.query(query, function(err, rows, fields) {
        if(err) { console.log(err); }

        extractLibraries(rows).then(function(idMap){
            resultsPromise.resolve(idMap);
        });
    });

    return resultsPromise.promise;

    function extractLibraries(libraries) {
        var idalIdsToCouchIds = {};
        var extractPromises = [];
        var resultsPromise = Q.defer();

        for (var i in libraries) {
            var mapLibraryPromise = mapLibraryCrmIdToIdalId(libraries[i]);

            extractPromises.push(mapLibraryPromise);

            mapLibraryPromise.then(function(resultObj){
                idalIdsToCouchIds[resultObj.idalLegacyId] = resultObj.couchId;
            });
        }

        Q.all(extractPromises).then(function(){
            resultsPromise.resolve(idalIdsToCouchIds);
        });

        return resultsPromise.promise;
    }

    function mapLibraryCrmIdToIdalId(libraryRow){
        return Q({
            couchId: getCrmId(libraryRow.name),
            idalLegacyId: libraryRow.id.toString()
        });
    }

    function getCrmId(idalLibraryName) {
        if (idalBlacklist.indexOf(idalLibraryName) !== -1) {
            return null;
        }
        if (staticIdalToCrmMap[idalLibraryName]) {
            return staticIdalToCrmMap[idalLibraryName].toString();
        }
        if (crmLibraryMapping[idalLibraryName.toLowerCase()]) {
            return crmLibraryMapping[idalLibraryName.toLowerCase()].toString();
        }
        console.log("Error: '" + idalLibraryName + "' not found");
    }
}

function loadCrmLibraryMapping(crmConnection) {
    var resultsPromise = Q.defer();

    var query = "select institution_name, member_id from members";
    crmConnection.query(query, function (err, rows, fields) {
        if (err) {
            console.log(err);
        }

        var crmLibraryMapping = {};
        rows.forEach(function (row) {
            crmLibraryMapping[row.institution_name.toLowerCase()] = row.member_id.toString();
        });
        resultsPromise.resolve(crmLibraryMapping);
    });

    return resultsPromise.promise;
}

module.exports = {
    migrateLibraries: migrateLibraries,
    loadCrmLibraryMapping: loadCrmLibraryMapping
};
