var OfferingRepository = require('../CARLI').Offering;
var Q = require('q');
var _ = require('lodash');

function migrateOfferings(connection, cycle, libraryIdMapping, productIdMapping){
    var resultsPromise = Q.defer();

    var query = "SELECT " +
    "    vds.id as id, " +
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
    "ORDER BY product_id, library_id;";

    connection.query(query, function(err, rows, fields) {
        //rows = rows.slice(0, 30000);

        console.log('  Migrating offerings for cycle "' + cycle.name + '" - got ' + rows.length + ' offerings');
        if(err) { console.log(err); }

        var uniqueOfferings = extractUniqueProductLibraryOfferings(rows, cycle, libraryIdMapping, productIdMapping);

        console.log('Extracted '+ Object.keys(uniqueOfferings).length +' unique Offerings');
        var offeringsList = extractPricingForOfferings(uniqueOfferings, rows, cycle, libraryIdMapping, productIdMapping);
        console.log('Extracted pricing lists for offerings');

        var emptyOfferingsList = [];

        return createExistingOfferings()
            .then(createEmptyOfferings)
            .then(function(){
                console.log('Created offerings 5/5');
                resultsPromise.resolve(offeringsList.length + emptyOfferingsList.length);
            });

        function createExistingOfferings() {
            var offeringsPartitions = partitionOfferingsList(offeringsList, 5);

            createOfferings(offeringsPartitions[0], cycle, libraryIdMapping, productIdMapping)
                .then(function () {
                    console.log('Created offerings 1/5');
                    return createOfferings(offeringsPartitions[1], cycle, libraryIdMapping, productIdMapping)
                })
                .then(function () {
                    console.log('Created offerings 2/5');
                    return createOfferings(offeringsPartitions[2], cycle, libraryIdMapping, productIdMapping)
                })
                .then(function () {
                    console.log('Created offerings 3/5');
                    return createOfferings(offeringsPartitions[3], cycle, libraryIdMapping, productIdMapping)
                })
                .then(function () {
                    console.log('Created offerings 4/5');
                    return createOfferings(offeringsPartitions[4], cycle, libraryIdMapping, productIdMapping)
                });
        }

        function createEmptyOfferings() {
            Object.keys(productIdMapping).forEach(function (productIdalId) {
                var productCouchId = productIdMapping[productIdalId];
                Object.keys(libraryIdMapping).forEach(function (libraryIdalId) {
                    var libraryCouchId = libraryIdMapping[libraryIdalId];
                    // If offeringKey() was not in uniqueOfferings then
                    var key = {
                        product_id: productIdalId,
                        library_id: libraryIdalId
                    };
                    if (!uniqueOfferings.hasOwnProperty(offeringKey(key))) {
                        emptyOfferingsList.push(createEmptyOfferingObject(cycle, libraryCouchId, productCouchId));
                    }
                });
            });
            createOfferings(emptyOfferingsList, cycle);
        }

    });

    return resultsPromise.promise;
}


/*
 * http://stackoverflow.com/questions/11345296/partitioning-in-javascript/11345570#11345570
 */
function partitionOfferingsList( list, numParts ){
    var partLength = Math.floor(list.length / numParts);

    var result = _.groupBy(list, function(item , i) {
        return Math.floor(i/partLength);
    });
    return _.values(result);
}

function extractUniqueProductLibraryOfferings(offeringRows, cycle, libraryIdMapping, productIdMapping) {
    var uniqueOfferings = {};

    for (var i in offeringRows) {
        var row = offeringRows[i];
        if (uniqueOfferings[offeringKey(row)]) {
            continue;
        }
        uniqueOfferings[offeringKey(row)] = extractNascentOffering(row, cycle, libraryIdMapping, productIdMapping);
    }
    
    return uniqueOfferings;
}

function extractPricingForOfferings(uniqueOfferings, offeringRows) {
    for (var i in offeringRows) {
        var row = offeringRows[i];
        var key = offeringKey(row);
        if (row.su == 0) {
            uniqueOfferings[key].pricing.site = row.price;
        } else {
            uniqueOfferings[key].pricing.su.push({
                users: row.su,
                price: row.price
            });
        }
    }
    return Object.keys(uniqueOfferings).map(function(k) {
        return uniqueOfferings[k];
    });
}

function createOfferings(offeringsList, cycle){
    var createPromises = [];
    var resultsPromise = Q.defer();

    for (var i in offeringsList) {
        if (offeringsList[i].library) {
            var createOfferingPromise = createOffering(offeringsList[i], cycle);
            createPromises.push(createOfferingPromise);
        }
    }

    Q.all(createPromises).then(function(){
        resultsPromise.resolve();
    });

    return resultsPromise.promise;
}

function createOffering( offering, cycle ) {
    var couchIdPromise = Q.defer();
    OfferingRepository.create( offering, cycle )
        .then(function(id) {
            couchIdPromise.resolve();
        })
        .catch(function(err) {
            console.log('Error creating offering: ', err);
            couchIdPromise.reject();
        });

    return couchIdPromise.promise;
}

function extractNascentOffering( row, cycle, libraryIdMapping, productIdMapping ){
    return {
        display: 'with-price',
        library: libraryIdMapping[row.library_id],
        product: productIdMapping[row.product_id],
        cycle: cycle,
        pricing: {
            su : []
        }
    };
}
function createEmptyOfferingObject( cycle, libraryCouchId, productCouchId ){
    return {
        display: 'without-price',
        library: libraryCouchId,
        product: productCouchId,
        cycle: cycle,
        pricing: {
            su : []
        }
    };
}

function offeringKey(o) {
    return o.product_id + '-' + o.library_id;
}

module.exports = {
    migrateOfferings: migrateOfferings
};
