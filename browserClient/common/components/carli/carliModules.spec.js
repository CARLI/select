describe('The CarliModules Service', function(){

    beforeEach( module('common.carliModules') );

    it( 'should provide the CARLI module', inject( function(CarliModules) {
        expect(CarliModules).to.be.an('Object');
    }));

    it( 'should export the Cycle module', inject( function(CarliModules) {
        expect(CarliModules.Cycle).to.be.an('Object');
    }));

    it( 'should export the Vendor module', inject( function(CarliModules) {
        expect(CarliModules.Vendor).to.be.an('Object');
    }));

    it( 'should export the Library module', inject( function(CarliModules) {
        expect(CarliModules.Library).to.be.an('Object');
    }));

    it( 'should export the Store interface', inject( function(CarliModules) {
        expect(CarliModules.Store).to.be.a('Function');
    }));

    it( 'should export the MemoryStore module', inject( function(CarliModules) {
        expect(CarliModules.MemoryStore).to.be.a('Function');
    }));

});
