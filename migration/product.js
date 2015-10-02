var ProductRepository = require('../CARLI').Product;
var Q = require('q');
var util = require('./util');
var uuid = require('node-uuid');

var couchIdForIdalProduct = {};

function migrateProducts(connection, cycle, vendorIdMapping, productLicenseMapping){
    var resultsPromise = Q.defer();

    var query = "SELECT v.id AS vendor_id, " +
        "v.name AS vendor_name, " +
        "d.name AS product_name, " +
        "d.id AS product_id " +
        "FROM vendor v, vendor_db vd, db d, vendor_db_su vds, collections c " +
        "WHERE " +
        "c.id = "+cycle.idalId+" AND " +
        "c.id = vd.collection_id AND " +
        "c.id = vds.collection_id AND " +
        "v.id = vd.vendor_id AND " +
        "vd.db_id = d.id AND " +
        "vds.vendor_db_id = vd.id AND " +
        "vds.price > 0 " +
        "GROUP BY vendor_name, product_name " +
        "ORDER BY vendor_name, product_name";

    connection.query(query, function(err, rows, fields) {
        Logger.log('  Migrating products for ' + cycle.name + ': ' + rows.length + ' products');
        if(err) { Logger.log(err); }

        extractProducts(rows, cycle, vendorIdMapping, productLicenseMapping).then(function(idMap){
            resultsPromise.resolve(idMap);
        });
    });

    return resultsPromise.promise;
}

function extractProducts(productRows, cycle, vendorIdMapping, productLicenseMapping){
    var couchIdsToIdalIds = {};
    var extractProductsPromises = [];
    var resultsPromise = Q.defer();

    for (var i in productRows) {
        var createProductPromise = createProduct(productRows[i], cycle, vendorIdMapping, productLicenseMapping);

        extractProductsPromises.push(createProductPromise);

        createProductPromise.then(function(resultObj){
            couchIdsToIdalIds[resultObj.idalLegacyId] = resultObj.couchId;
        });
    }

    Q.all(extractProductsPromises).then(function(){
        resultsPromise.resolve(couchIdsToIdalIds);
    });

    return resultsPromise.promise;   
}

function createProduct( productRow, cycle, vendorIdMapping, productLicenseMapping ) {
    var product = extractProduct(productRow, cycle, vendorIdMapping, productLicenseMapping);
    return ProductRepository.create( product, cycle )
        .then(function(id) {
            return {
                idalLegacyId: util.makeUniqueProductIdFromDatabaseRow(productRow),
                couchId: id
            };
        })
        .catch(function(err) {
            Logger.log('Error creating product: ', err);
        });
}

function extractProduct( row, cycle, vendorIdMapping, productLicenseMapping ){
    var legacyId = util.makeUniqueProductIdFromDatabaseRow(row);
    var licenseMappingKey = legacyId;

    var productCouchId = couchIdForIdalProduct[legacyId] || uuid.v4();

    return {
        id: productCouchId,
        name: row.product_name,
        vendor: vendorIdMapping[row.vendor_id],
        cycle: cycle,
        productUrl: '',
        description: '',
        comments: '',
        license: productLicenseMapping[licenseMappingKey] || null,
        licenseType: {
            isThirdPartyProduct: false,
            isSoleSource: false,
            isSealedBid: false,
            isConsolidatedList: false,
            isRfp: false,
            isOtherType: false,
            otherType: '',
            hasArchiveCapitalFee: false
        },
        isActive: true
    };
}


function generateCouchIdsForAllIdalProducts(connection){
    var vendorIds = [];
    var productIds = [];

    return getIdalVendorIds(connection)
        .then(function(vendorIdList){
            vendorIds = vendorIdList;
            return getIdalProductsIds(connection);
        })
        .then(function(productIdList){
            productIds = productIdList;
            return mapCouchIdsToLegacyProductIds();
        });

    function mapCouchIdsToLegacyProductIds(){
        var results = {};

        Logger.log('Generating couch IDs for ' + productIds.length + ' x ' + vendorIds.length + '  vendors');

        vendorIds.forEach(function(vendorId){
            productIds.forEach(function(productId){
                var legacyId = util.makeProductLegacyId(vendorId, productId);
                results[legacyId] = uuid.v4();
            });
        });

        couchIdForIdalProduct = results;
        return results;
    }
}

function getIdalVendorIds(connection){
    var vendorIdsPromise = Q.defer();

    var query = "SELECT id FROM vendor";

    connection.query(query, function(err, rows, fields) {
        if(err) {
            Logger.log('error getting vendor ids from IDAL', err);
        }
        vendorIdsPromise.resolve( rows.map(extractId) );
    });

    return vendorIdsPromise.promise;
}

function getIdalProductsIds(connection){
    var productIdsPromise = Q.defer();

    var query = "SELECT id FROM db";

    connection.query(query, function(err, rows, fields) {
        if(err) {
            Logger.log('error getting product ids from IDAL', err);
        }
        productIdsPromise.resolve( rows.map(extractId) );
    });

    return productIdsPromise.promise;
}

function extractId( object ){
    return object.id;
}

module.exports = {
    migrateProducts: migrateProducts,
    generateCouchIdsForAllIdalProducts: generateCouchIdsForAllIdalProducts
};
