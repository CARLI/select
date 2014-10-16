var chai   = require( 'chai' )
  , expect = chai.expect
;

describe( 'Vendor', function() {
    it( 'should be a module', function() {
        var Vendor = require( './Vendor' );
        expect(Vendor).to.be.an('Object');
    } );
} );

