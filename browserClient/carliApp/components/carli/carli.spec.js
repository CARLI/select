describe('The Carli Service', function(){

    beforeEach( module('carli.service') );

    it( 'should provide the Carli service', inject( function(Carli) {
        expect(Carli).to.be.an('Object');
    }));
});
