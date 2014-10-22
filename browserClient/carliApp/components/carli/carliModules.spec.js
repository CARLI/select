describe('The CarliModules Service', function(){

    beforeEach( module('carli.carliModules.service') );

    it( 'should provide the CARLI module', inject( function(CarliModules) {
        expect(CarliModules).to.be.an('Object');
    }));

    it( 'should export the Vendor module', inject( function(CarliModules) {
        expect(CarliModules.Vendor).to.be.an('Object');
    }));

    it( 'should export the Store interface', inject( function(CarliModules) {
        expect(CarliModules.Store).to.be.a('Function');
    }));

    it( 'should export the FixtureStore module', inject( function(CarliModules) {
        expect(CarliModules.FixtureStore).to.be.an('Object');
    }));

});
