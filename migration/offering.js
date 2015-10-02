var OfferingRepository = require('../CARLI').Offering;
var libraryRepository = require('../CARLI').Library;
var Q = require('q');
var util = require('./util');
var _ = require('lodash');

function migrateOfferings(connection, cycle, libraryIdMapping, productIdMapping, selectionsByLibrary){
    var resultsPromise = Q.defer();
    var batchSize = 500;
    var offeringsThatExist = {};

    var query = "SELECT " +
    "    v.id as vendor_id, " +
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

        Logger.log('  Migrating offerings for cycle "' + cycle.name + '" - got ' + rows.length + ' offerings');
        if(err) { Logger.log(err); }

        var uniqueOfferings = extractUniqueProductLibraryOfferings(rows, cycle, libraryIdMapping, productIdMapping);

        Logger.log('Extracted '+ Object.keys(uniqueOfferings).length +' unique Offerings');
        var offeringsList = extractPricingForOfferings(uniqueOfferings, rows, cycle, libraryIdMapping, productIdMapping);

        //Convert legacy ID's to new couch ids, attach selections, and track offerings that were created
        offeringsList.forEach(finalizeOffering);

        var emptyOfferingsList = [];

        return createExistingOfferings()
            .then(libraryRepository.listActiveLibraries)
            .then(createEmptyOfferings)
            .then(function(){
                resultsPromise.resolve(offeringsList.length + emptyOfferingsList.length);
            })
            .catch(function(err){
                Logger.log('Error creating offerings', err);
                throw err;
            });

        function createExistingOfferings() {
            var numBatches = Math.floor(offeringsList.length / batchSize);
            return createOfferingsInBatches(offeringsList, numBatches);
        }

        function createOfferingsInBatches(list, numBatches) {
            var offeringsPartitions = partitionOfferingsList(list, numBatches);
            var currentBatch = 0;

            return createNextBatch();

            function createNextBatch(results) {
                if (currentBatch == numBatches) {
                    return results;
                }
                Logger.log('['+ cycle.name +'] Creating offerings '+ (currentBatch + 1) +'/' + numBatches);
                return createOfferings(offeringsPartitions[currentBatch], cycle)
                    .then(incrementBatch)
                    .then(createNextBatch);
            }

            function incrementBatch(results) {
                currentBatch++;
                return results;
            }
        }

        function createEmptyOfferings(libraryList) {
            Logger.log('Generating empty offerings');

            Object.keys(productIdMapping).forEach(function (productLegacyId) {
                var productCouchId = productIdMapping[productLegacyId];

                libraryList.forEach(function(library) {
                    var libraryCouchId = library.id;
                    var offeringKey = makeOfferingKey(productLegacyId, libraryCouchId);

                    if (!offeringsThatExist[offeringKey]) {
                        emptyOfferingsList.push(createEmptyOfferingObject(cycle, libraryCouchId, productCouchId));
                    }
                });
            });
            Logger.log('Creating '+ emptyOfferingsList.length +' empty offerings');

            var numBatches = Math.floor(emptyOfferingsList.length / batchSize);

            return createOfferingsInBatches(emptyOfferingsList, numBatches)
                .then(function(result) {
                    Logger.log('Created '+ emptyOfferingsList.length +' empty offerings');
                    return result;
                });
        }

    });

    return resultsPromise.promise;


    function finalizeOffering( offering ){
        var libraryIdalId = offering.libraryIdalId;
        var libraryCrmId = offering.libraryCrmId;
        var productLegacyId = offering.productLegacyId;
        var productCouchId = productIdMapping[productLegacyId];

        if ( selectionsByLibrary[libraryIdalId] && selectionsByLibrary[libraryIdalId][productCouchId] ){
            offering.selection = selectionsByLibrary[libraryIdalId][productCouchId];
        }

        offering.library = libraryCrmId;
        offering.product = productCouchId;
        delete offering.libraryCrmId;
        delete offering.libraryIdalId;
        delete offering.productLegacyId;

        offeringsThatExist[makeOfferingKey(productLegacyId,libraryCrmId)] = true;
    }
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
            Logger.log('Error creating offering: ', err);
            Logger.log(offering);
            couchIdPromise.reject();
        });

    return couchIdPromise.promise;
}

function extractNascentOffering( row, cycle, libraryIdMapping, productIdMapping ){
    return {
        display: 'with-price',
        libraryIdalId: row.library_id,
        libraryCrmId: libraryIdMapping[row.library_id],
        productLegacyId: util.makeUniqueProductIdFromDatabaseRow(row),
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

function offeringKey(row) {
    return makeOfferingKey(util.makeUniqueProductIdFromDatabaseRow(row), row.library_id);
}

function makeOfferingKey( productId, libraryId ){
    return productId + '_' + libraryId;
}

module.exports = {
    migrateOfferings: migrateOfferings
};
