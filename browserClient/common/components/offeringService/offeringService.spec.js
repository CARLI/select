describe('The Offering service', function() {
    beforeEach(module('common.offeringService'));

    it( 'should provide offeringService', inject( function(offeringService) {
        expect(offeringService).to.be.an('Object');
    }));

    it( 'should provide a list method', inject( function(offeringService) {
        expect(offeringService.list).to.be.a('Function');
    }));

    it( 'should provide a create method', inject( function(offeringService) {
        expect(offeringService.create).to.be.a('Function');
    }));

    it( 'should provide a update method', inject( function(offeringService) {
        expect(offeringService.update).to.be.a('Function');
    }));

    it( 'should provide a load method', inject( function(offeringService) {
        expect(offeringService.load).to.be.a('Function');
    }));

    it( 'should provide a listOfferingsForLibraryId method', inject( function(offeringService) {
        expect(offeringService.listOfferingsForLibraryId).to.be.a('Function');
    }));

    it( 'should provide a listOfferingsForProductId method', inject( function(offeringService) {
        expect(offeringService.listOfferingsForProductId).to.be.a('Function');
    }));

    it( 'should provide a getOfferingDisplayOptions method', inject( function(offeringService) {
        expect(offeringService.getOfferingDisplayOptions).to.be.a('Function');
        expect(offeringService.getOfferingDisplayOptions()).to.be.an('Array');
    }));
});
