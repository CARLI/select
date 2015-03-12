describe('The Notification Service', function() {
    beforeEach(module('carli.notificationService'));

    it( 'should provide notificationService', inject( function(notificationService) {
        expect(notificationService).to.be.an('object');
    }));

    it( 'should provide a list method', inject( function(notificationService) {
        expect(notificationService.list).to.be.a('Function');
    }));

    it( 'should provide a create method', inject( function(notificationService) {
        expect(notificationService.create).to.be.a('Function');
    }));

    it( 'should provide a update method', inject( function(notificationService) {
        expect(notificationService.update).to.be.a('Function');
    }));

    it( 'should provide a load method', inject( function(notificationService) {
        expect(notificationService.load).to.be.a('Function');
    }));
});
