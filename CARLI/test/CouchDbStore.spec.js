var test   = require( './Store/StoreInterface.spec' )
  , config = require( '../config' )
;

test.run( 'CouchDb/Store', config.storeOptions );
