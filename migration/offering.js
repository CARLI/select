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
                resultsPromise.resolve(offeringsList.length + emptyOfferingsList.length);
            });

        function createExistingOfferings() {
            return createOfferingsInBatches(offeringsList, 20);
        }

        function createOfferingsInBatches1(list) {
            var offeringsPartitions = partitionOfferingsList(list, 10);

            return createOfferings(offeringsPartitions[0], cycle)
                .then(function () {
                    console.log('Created offerings 1/10');
                    return createOfferings(offeringsPartitions[1], cycle)
                })
                .then(function () {
                    console.log('Created offerings 2/10');
                    return createOfferings(offeringsPartitions[2], cycle)
                })
                .then(function () {
                    console.log('Created offerings 3/10');
                    return createOfferings(offeringsPartitions[3], cycle)
                })
                .then(function () {
                    console.log('Created offerings 4/10');
                    return createOfferings(offeringsPartitions[4], cycle)
                })
                .then(function(result){
                    console.log('Created offerings 5/10');
                    return createOfferings(offeringsPartitions[5], cycle)
                })
                .then(function () {
                    console.log('Created offerings 6/10');
                    return createOfferings(offeringsPartitions[6], cycle)
                })
                .then(function () {
                    console.log('Created offerings 7/10');
                    return createOfferings(offeringsPartitions[7], cycle)
                })
                .then(function () {
                    console.log('Created offerings 8/10');
                    return createOfferings(offeringsPartitions[8], cycle)
                })
                .then(function () {
                    console.log('Created offerings 9/10');
                    return createOfferings(offeringsPartitions[9], cycle)
                })
                .then(function(result){
                    console.log('Created offerings 10/10');
                    return result;
                });
        }
        function createOfferingsInBatches(list, numBatches) {
            var offeringsPartitions = partitionOfferingsList(list, numBatches);
            var currentBatch = 0;

            return createNextBatch();

            function createNextBatch(results) {
                if (currentBatch == numBatches) {
                    return results;
                }
                console.log('Created offerings '+ (currentBatch + 1) +'/' + numBatches);
                return createOfferings(offeringsPartitions[currentBatch], cycle)
                    .then(incrementBatch)
                    .then(createNextBatch);
            }

            function incrementBatch(results) {
                currentBatch++;
                return results;
            }
        }

        function createEmptyOfferings() {
            console.log('Generating empty offerings');

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
            console.log('Creating '+ emptyOfferingsList.length +' empty offerings');

            return createOfferingsInBatches(emptyOfferingsList, 20)
                .then(function(result) {
                    console.log('Created '+ emptyOfferingsList.length +' empty offerings');
                    return result;
                });
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
            console.log(offering);
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
