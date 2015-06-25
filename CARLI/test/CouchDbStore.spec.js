var test   = require( './Store/StoreInterface.spec' )
  , testUtils = require( './utils' )
;

var testOptions = testUtils.getTestDbStoreOptions();

test.run( 'CouchDb/Store', testOptions);
