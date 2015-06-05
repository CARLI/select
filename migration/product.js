var ProductRepository = require('../CARLI').Product;
var Q = require('q');
var util = require('./util');

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
        console.log('  Migrating products for cycle "' + cycle.name + '" - got ' + rows.length + ' products');
        if(err) { console.log(err); }

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
            console.log('Error creating product: ', err);
        });
}

function extractProduct( row, cycle, vendorIdMapping, productLicenseMapping ){
    var licenseMappingKey = util.makeUniqueProductIdFromDatabaseRow(row);

    return {
        name: row.product_name,
        vendor: vendorIdMapping[row.vendor_id],
        cycle: cycle,
        productUrl: '',
        description: '',
        comments: '',
        license: productLicenseMapping[licenseMappingKey],
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

module.exports = {
    migrateProducts: migrateProducts
};
