var offeringRepository = require('../CARLI').Offering;
var Q = require('q');
var util = require('./util');

function gatherSelections(connection, cycle, productMapping){
    var resultsPromise = Q.defer();

    var query = "SELECT library_db_item.library_id, " +
        "vendor_db.vendor_id, " +
        "vendor_db.db_id as product_id, " +
        "vendor_db_su.num_su, " +
        "vendor_db_su.price " +
        "FROM library_db_item, vendor_db_su, vendor_db " +
        "WHERE library_db_item.vendor_db_su_id = vendor_db_su.id " +
        "AND vendor_db_su.vendor_db_id = vendor_db.id " +
        "AND vendor_db_su.collection_id = vendor_db.collection_id " +
        "AND vendor_db_su.price > 0 " +
        "AND vendor_db_su.collection_id = "+ cycle.idalId + ";";

    connection.query(query, function(err, rows, fields) {
        if(err) { Logger.log(err); }

        var results = {};

        Logger.log('  Found ' + rows.length + ' selections for ' + cycle.name);

        rows.forEach(addSelectionToResults);

        resultsPromise.resolve(results);

        function addSelectionToResults(selectionRow){
            var libraryIdalId = selectionRow.library_id.toString();
            var legacyProductId = util.makeUniqueProductIdFromDatabaseRow(selectionRow);
            var productCouchId = productMapping[legacyProductId];

            results[libraryIdalId] = results[libraryIdalId] || {};
            results[libraryIdalId][productCouchId] = extractSelection( selectionRow );
        }
    });

    return resultsPromise.promise;
}

function extractSelection( selectionRow ){
    return {
        price: selectionRow.price,
        users: selectionRow.num_su === 0 ? offeringRepository.siteLicenseSelectionUsers : selectionRow.num_su
    }
}

module.exports = {
    gatherSelections: gatherSelections
};
