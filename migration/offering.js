var OfferingRepository = require('../CARLI').Offering;
var Q = require('q');

function migrateOfferings(connection, cycle, libraryIdMapping, offeringIdMapping){
    var resultsPromise = Q.defer();

    var query = "SELECT " +
    "    vds.id as id " +
    "    vd.library_id, " +
    "    d.id as product_id, " +
    "    num_su as su, " +
    "    vds.price as price " +
    "FROM vendor v, vendor_db vd, db d, vendor_db_su vds, collections c " +
    "WHERE " +
    "c.id = " + cycle.idalId + " AND " +
    "c.id = vd.collection_id AND " +
    "c.id = vds.collection_id AND " +
    "v.id = vd.vendor_id AND " +
    "vd.db_id = d.id AND " +
    "vds.vendor_db_id = vd.id AND " +
    "vds.price > 0 " +
    "ORDER BY product_id, library_id;"

    connection.query(query, function(err, rows, fields) {
        console.log('  Migrating offerings for cycle "' + cycle.name + '" - got ' + rows.length + ' offerings');
        if(err) { console.log(err); }

        extractOfferings(rows, cycle, libraryIdMapping, productIdMapping).then(function(idMap){
            resultsPromise.resolve(idMap);
        });
    });

    return resultsPromise.promise;
}

function extractOfferings(offeringRows, cycle, libraryIdMapping, productIdMapping){
    var couchIdsToIdalIds = {};
    var extractOfferingsPromises = [];
    var resultsPromise = Q.defer();

    for (var i in offeringRows) {
        var createOfferingPromise = createOffering(offeringRows[i], cycle, libraryIdMapping, productIdMapping);

        extractOfferingsPromises.push(createOfferingPromise);

        createOfferingPromise.then(function(resultObj){
            couchIdsToIdalIds[resultObj.idalLegacyId] = resultObj.couchId;
        });
    }

    Q.all(extractOfferingsPromises).then(function(){
        resultsPromise.resolve(couchIdsToIdalIds);
    });

    return resultsPromise.promise;
}

function createOffering( offeringRow, cycle, libraryIdMapping, productIdMapping ) {
    var couchIdPromise = Q.defer();
    var offering = extractOffering(offeringRow, cycle, libraryIdMapping, productIdMapping);
    OfferingRepository.create( offering, cycle )
        .then(function(id) {
            couchIdPromise.resolve({
                idalLegacyId: offeringRow.id,
                couchId: id
            });
        })
        .catch(function(err) {
            console.log('Error creating offering: ', err);
            couchIdPromise.reject();
        });

    return couchIdPromise.promise;
}

function extractOffering( row, cycle, libraryIdMapping, productIdMapping ){
    var offering = {
        library: libraryIdMapping[row.library_id],
        product: productIdMapping[row.product_id],
        cycle: cycle,
        pricing: {
            su : {}
        }
    };

    offering.pricing.su[row.su] = row.price;
    return offering;
}

module.exports = {
    migrateOfferings: migrateOfferings
};