describe('The Entity Base Service', function() {
    beforeEach(module('carli.entityBaseService'));

    it('should provide entityBaseService', inject(function (entityBaseService) {
        expect(entityBaseService).to.be.an('object');
    }));

    it('should provide the Entity active/inactive status options', inject(function (entityBaseService) {
        var testData = [
            {
                label: 'Active',
                value: true
            },
            {
                label: 'Inactive',
                value: false
            }
        ];
        expect(entityBaseService.getStatusOptions).to.be.a('function');
        expect(entityBaseService.getStatusOptions()).to.deep.include.members(testData);
    }));
});

