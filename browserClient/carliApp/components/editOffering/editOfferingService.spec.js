describe('The Edit Offering service', function() {
    beforeEach(module('carli.cycleService'));
    beforeEach(module('carli.editOffering'));

    it( 'should provide a getCurrentOffering method', inject( function(editOfferingService) {
        expect(editOfferingService.receiveOfferingEditableMessage).to.be.a('Function');
    }));

    it( 'should provide a setCurrentOffering method', inject( function(editOfferingService) {
        expect(editOfferingService.acknowledgeOfferingMadeEditable).to.be.a('Function');
    }));
});
