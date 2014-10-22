var chai   = require( 'chai' )
  , expect = chai.expect
  , CARLI  = require( '../CARLI' )
;

describe( 'CARLI', function() {

    it( 'should be a module', function() {
        expect(CARLI).to.be.an('Object');
    } );

    it( 'should export the Vendor module', function() {
        expect(CARLI.Vendor).to.be.an('Object');
    } );

    it( 'should export a Store Interface', function() {
        expect(CARLI.Store).to.be.a('Function');
    } );

    it( 'should export the FixtureStore module', function() {
        expect(CARLI.FixtureStore).to.be.an('Object');
    } );

    it( 'should export the FileStore module', function() {
        expect(CARLI.FileStore).to.be.an('Object');
    } );
} );
