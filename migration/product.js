var ProductRepository = require('../CARLI').Product;
var CouchDbStore = require('../CARLI').CouchDbStore;
var carliConfig = require('../CARLI').config;
var StoreOptions = carliConfig.storeOptions;
var Store = require('../CARLI').Store;
var Q = require('q');
ProductRepository.setStore(Store(CouchDbStore(StoreOptions)));

function migrateProducts(connection, cycle, vendorIdMapping){
    var resultsPromise = Q.defer();

    var query = "SELECT v.id AS vendor_id, " +
        "v.name AS vendor_name, " +
        "d.name AS product_name " +
        "FROM vendor v, vendor_db vd, db d, vendor_db_su vds, collections c " +
        "WHERE " +
        "c.id = "+cycle.idalId+" AND " +
        "c.id = vd.collection_id AND " +
        "c.id = vds.collection_id AND " +
        "v.id = vd.vendor_id AND " +
        "vd.db_id = d.id AND " +
        "vds.vendor_db_id = vd.id AND " +
        "vds.price > 0 " +
        "GROUP BY product_name " +
        "ORDER BY vendor_name, product_name";

    console.log('Go check your email or something, this query is slow...');

    connection.query(query, function(err, rows, fields) {
        if(err) { console.log(err); }
        products = rows;

        extractProducts(rows, cycle, vendorIdMapping).then(function(idMap){
            extractProducts.resolve(idMap);
        });
    });

    return resultsPromise.promise;
}

function extractProducts(productRows, cycle, vendorIdMapping){
    var couchIdsToIdalIds = {};
    var extractProductsPromises = [];
    var resultsPromise = Q.defer();

    for (var i in products) {
        var createProductPromise = createProduct(productRows[i], cycle, vendorIdMapping);

        extractProductsPromises.push(createProductPromise);

        createProductPromise.then(function(resultObj){
            couchIdsToIdalIds[resultObj.couchId] = resultObj.idalLegacyId;
        });
    }

    Q.all(extractProductsPromises).then(function(){
        resultsPromise.resolve(couchIdsToIdalIds);
    });

    return resultsPromise.promise;   
}

function createProduct( productRow, cycle, vendorIdMapping ) {
    console.log('creating: ' + productRow.product_name);

    var couchIdPromise = Q.defer();
    var product = extractProduct(productRow, cycle, vendorIdMapping);

    ProductRepository.create( product )
        .then(function(id) {
            console.log('ok: ' + id);
            couchIdPromise.resolve({
                couchId: id,
                idalLegacyId: productRow.id
            });
        })
        .catch(function(err) {
            console.log(err);
            couchIdPromise.reject();
        });

    return couchIdPromise.promise;
}

function extractProduct( row, cycle, vendorIdMapping ){
    return {
        name: row.product_name,
        vendor: vendorIdMapping[row.vendor_id],
        productUrl: '',
        description: '',
        comments: '',
        isThirdPartyProduct: false,
        hasArchiveCapitalFee: false,
        cycleType: cycle.type,
        isActive: true
//        fundings: '',
//        license: '',
//        terms: '',
//        priceCap: '',
//        detailCode: '',
//        librariesThatHavePaidAcf: '',
//        oneTimePurchase: ''
    };
}

module.exports = {
    migrateProducts: migrateProducts
};