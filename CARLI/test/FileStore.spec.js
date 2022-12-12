var test   = require( './Store/StoreInterface.spec' )
  , uuid   = require( 'node-uuid' )
  , rimraf = require( 'rimraf' )
  , os = require('os')
  , testDir = os.tmpdir() + '/carli-' + uuid.v4();
;

describe.skip( '', function() {
  test.run( 'FileStore', { resourcePath: testDir } );
  after( function() {
    rimraf.sync( testDir );
  } );
} );
