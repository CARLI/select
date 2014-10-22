describe('The CARLI Service', function(){

    beforeEach( module('carli.service') );

    it( 'should provide the CARLI module', inject( function(CARLI) {
        expect(CARLI).to.be.an('Object');
    }));

    it( 'should export the Vendor module', inject( function(CARLI) {
        expect(CARLI.Vendor).to.be.an('Object');
    }));

    it( 'should export the Store interface', inject( function(CARLI) {
        expect(CARLI.Store).to.be.a('Function');
    }));

    it( 'should export the FixtureStore module', inject( function(CARLI) {
        expect(CARLI.FixtureStore).to.be.an('Object');
    }));
});
