
var CARLI  = require( '../../CARLI'),
    dbUrl  = CARLI.config.storeOptions.couchDbUrl,
    dbName = CARLI.config.storeOptions.couchDbName
    ;

var storeOptions = {
    couchDbUrl: dbUrl,
    couchDbName: dbName
};
var store = CARLI.Store( CARLI.CouchDbStore(storeOptions) );

CARLI.Library.setStore( store );
CARLI.License.setStore( store );
CARLI.Vendor.setStore( store );
CARLI.Product.setStore( store );


module.exports = {
    createLibrary : function (libData) {
        CARLI.Library.create(libData);
    }
}
