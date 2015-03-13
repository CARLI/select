
describe('The Notification Modal Service', function() {
    beforeEach(module('carli.notificationModal'));

    it( 'should provide notificationModalService', inject( function(notificationModalService) {
        expect(notificationModalService).to.be.an('object');
    }));

    it( 'should provide a sendStartDraft method', inject( function(notificationCreationService) {
        expect(notificationCreationService.sendStartDraft).to.be.a('Function');
    }));
    it( 'should provide a receiveStartDraft method', inject( function(notificationCreationService) {
        expect(notificationCreationService.receiveStartDraft).to.be.a('Function');
    }));
    it( 'should provide a acknowledgeStartDraft method', inject( function(notificationCreationService) {
        expect(notificationCreationService.acknowledgeStartDraft).to.be.a('Function');
    }));

});
