describe('The Entity Base Service', function() {
    beforeEach(module('carli.entityBaseService'));

    it('should provide entityBaseService', inject(function (entityBaseService) {
        expect(entityBaseService).to.be.an('object');
    }));
});

