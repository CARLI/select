describe('The Notification Template Service', function() {
    beforeEach(module('carli.notificationTemplateService'));

    it( 'should provide notificationTemplateService', inject( function(notificationTemplateService) {
        expect(notificationTemplateService).to.be.an('object');
    }));

    it( 'should provide a list method', inject( function(notificationTemplateService) {
        expect(notificationTemplateService.list).to.be.a('Function');
    }));

    it( 'should provide a create method', inject( function(notificationTemplateService) {
        expect(notificationTemplateService.create).to.be.a('Function');
    }));

    it( 'should provide a update method', inject( function(notificationTemplateService) {
        expect(notificationTemplateService.update).to.be.a('Function');
    }));

    it( 'should provide a load method', inject( function(notificationTemplateService) {
        expect(notificationTemplateService.load).to.be.a('Function');
    }));
});
