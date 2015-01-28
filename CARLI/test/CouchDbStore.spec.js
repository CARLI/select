var test   = require( './Store/StoreInterface.spec' )
  , testUtils = require( './utils' )
  , couchUtils = require('../Store/CouchDb/Utils')
;

var testOptions = testUtils.getTestDbStoreOptions();

test.run( 'CouchDb/Store', testOptions);
