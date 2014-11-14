var test   = require( './Store/StoreInterface.spec' )
  , config = require( '../config' )
;

test.run( 'CouchDbStore', config.storeOptions );
