var test   = require( './Store/StoreInterface.spec' )
  , uuid   = require( 'node-uuid' )
  , rimraf = require( 'rimraf' )
  , testDir = '/tmp/carli-' + uuid.v4();
;

describe( '', function() {
  test.run( 'FileStore', { resourcePath: testDir } );
  after( function() {
    rimraf.sync( testDir );
  } );
} );
