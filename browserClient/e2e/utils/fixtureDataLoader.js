
var CARLI  = require( '../../../CARLI')
    ;

var storeOptions = {
    couchDbUrl: CARLI.config.storeOptions.couchDbUrl,
    couchDbName: CARLI.config.storeOptions.couchDbName
};
var store = CARLI.Store( CARLI.CouchDbStore(storeOptions) );

CARLI.Library.setStore( store );
CARLI.License.setStore( store );
CARLI.Vendor.setStore( store );
CARLI.Product.setStore( store );


module.exports = {
    createLibrary : function (data) {
        CARLI.Library.create(data);
    },

    createVendor : function (data) {
        CARLI.Vendor.create(data);
    },

    createProduct : function (data) {
        CARLI.Product.create(data);
    },

    createLicense : function (data) {
        CARLI.License.create(data);
    }
};
