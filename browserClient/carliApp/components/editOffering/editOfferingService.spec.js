describe('The Offering service', function() {
    beforeEach(module('carli.editOffering'));

    it( 'should provide a getCurrentOffering method', inject( function(editOfferingService) {
        expect(editOfferingService.getCurrentOffering).to.be.a('Function');
    }));

    it( 'should provide a setCurrentOffering method', inject( function(editOfferingService) {
        expect(editOfferingService.setCurrentOffering).to.be.a('Function');
    }));
});
