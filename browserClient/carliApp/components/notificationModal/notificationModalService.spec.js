
describe('The Notification Modal Service', function() {
    beforeEach(module('carli.notificationModal'));

    it( 'should provide notificationModalService', inject( function(notificationModalService) {
        expect(notificationModalService).to.be.an('object');
    }));

    it( 'should provide a sendStartDraftMessage method', inject( function(notificationModalService) {
        expect(notificationModalService.sendStartDraftMessage).to.be.a('Function');
    }));
    it( 'should provide a receiveStartDraftMessage method', inject( function(notificationModalService) {
        expect(notificationModalService.receiveStartDraftMessage).to.be.a('Function');
    }));
    it( 'should provide a acknowledgeStartDraftMessage method', inject( function(notificationModalService) {
        expect(notificationModalService.acknowledgeStartDraftMessage).to.be.a('Function');
    }));

});
