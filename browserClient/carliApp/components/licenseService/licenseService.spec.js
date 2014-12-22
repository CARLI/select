describe('The License Service', function() {
    beforeEach(module('carli.licenseService'));

    it( 'should provide licenseService', inject( function(licenseService) {
        expect(licenseService).to.be.an('object');
    }));

    it( 'should provide a list method', inject( function(licenseService) {
        expect(licenseService.list).to.be.a('Function');
    }));

    it( 'should provide a create method', inject( function(licenseService) {
        expect(licenseService.create).to.be.a('Function');
    }));

    it( 'should provide a update method', inject( function(licenseService) {
        expect(licenseService.update).to.be.a('Function');
    }));

    it( 'should provide a load method', inject( function(licenseService) {
        expect(licenseService.load).to.be.a('Function');
    }));

    it( 'should provide a getOfferingTypeOptions method', inject( function(licenseService) {
        var testData = [
            {
                label: 'Product',
                value: "'Product'"
            },
            {
                label: 'Service',
                value: "'Service'"
            }
        ];

        expect(licenseService.getOfferingTypeOptions).to.be.a('Function');
        expect(licenseService.getOfferingTypeOptions()).to.deep.include.members(testData);
    }));
});
