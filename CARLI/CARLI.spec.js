var chai   = require( 'chai' )
  , expect = chai.expect
;

describe( 'CARLI', function() {
    it( 'should be a module', function() {
        var CARLI = require( './CARLI' );
        expect(CARLI).to.be.an('Object');
    } );
} );
