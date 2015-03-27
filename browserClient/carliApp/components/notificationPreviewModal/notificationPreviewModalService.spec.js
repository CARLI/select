
describe('The Notification Preview Modal Service', function() {
    beforeEach(module('carli.notificationPreviewModal'));

    it( 'should provide notificationPreviewModal', inject( function(notificationPreviewModalService) {
        expect(notificationPreviewModalService).to.be.an('object');
    }));

    it( 'should provide a sendShowPreviewMessage method', inject( function(notificationPreviewModalService) {
        expect(notificationPreviewModalService.sendShowPreviewMessage).to.be.a('Function');
    }));
    it( 'should provide a receiveShowPreviewMessage method', inject( function(notificationPreviewModalService) {
        expect(notificationPreviewModalService.receiveShowPreviewMessage).to.be.a('Function');
    }));
    it( 'should provide a acknowledgeShowPreviewMessage method', inject( function(notificationPreviewModalService) {
        expect(notificationPreviewModalService.acknowledgeShowPreviewMessage).to.be.a('Function');
    }));

});
