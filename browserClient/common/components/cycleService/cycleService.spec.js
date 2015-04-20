describe('The Cycle Service', function() {
    beforeEach(module('common.cycleService'));

    it( 'should provide cycleService', inject( function(cycleService) {
        expect(cycleService).to.be.an('object');
    }));

    it( 'should provide a list method', inject( function(cycleService) {
        expect(cycleService.list).to.be.a('Function');
    }));

    it( 'should provide a create method', inject( function(cycleService) {
        expect(cycleService.create).to.be.a('Function');
    }));

    it( 'should provide a update method', inject( function(cycleService) {
        expect(cycleService.update).to.be.a('Function');
    }));

    it( 'should provide a load method', inject( function(cycleService) {
        expect(cycleService.load).to.be.a('Function');
    }));

});
