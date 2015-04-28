var Q = require('q');

function gatherSelections(connection, cycle){
    var resultsPromise = Q.defer();

    var query = "SELECT library_db_item.library_id, " +
        "vendor_db.vendor_id, " +
        "vendor_db.db_id, " +
        "vendor_db_su.num_su, " +
        "vendor_db_su.price " +
        "FROM library_db_item, vendor_db_su, vendor_db " +
        "WHERE library_db_item.vendor_db_su_id = vendor_db_su.id " +
        "AND vendor_db_su.vendor_db_id = vendor_db.id " +
        "AND vendor_db_su.collection_id = vendor_db.collection_id " +
        "AND vendor_db_su.price > 0 " +
        "AND vendor_db_su.collection_id = "+ cycle.idalId + ";";

    connection.query(query, function(err, rows, fields) {
        if(err) { console.log(err); }

        var results = {};

        console.log('  Found ' + rows.length + ' selections for ' + cycle.name);

        //{
        //    "library_id": 1,
        //    "vendor_id": 30,
        //    "db_id": 168,
        //    "num_su": 0,
        //    "price": 1639
        //}

        resultsPromise.resolve(results);

    });

    return resultsPromise.promise;
}

module.exports = {
    gatherSelections: gatherSelections
};
