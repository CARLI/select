var chai   = require( 'chai' )
  , expect = chai.expect
  , CARLI  = require( '../../CARLI' )
;

describe( 'CARLI', function() {

    it( 'should be a module', function() {
        expect(CARLI).to.be.an('Object');
    } );

    it( 'should export the Vendor module', function() {
        expect(CARLI.Vendor).to.be.an('Object');
    } );

    it( 'should export the Library module', function() {
        expect(CARLI.Library).to.be.an('Object');
    } );

    it( 'should export a Store Interface', function() {
        expect(CARLI.Store).to.be.a('Function');
    } );

    it( 'should export the MemoryStore module', function() {
        expect(CARLI.MemoryStore).to.be.an('Object');
    } );

    it( 'should export the FileStore module', function() {
        expect(CARLI.FileStore).to.be.an('Object');
    } );
} );
