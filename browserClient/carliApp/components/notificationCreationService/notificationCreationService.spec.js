
describe('The Notification Creation Service', function() {
    beforeEach(module('carli.notificationCreationService'));

    it( 'should provide notificationCreationService', inject( function(notificationCreationService) {
        expect(notificationCreationService).to.be.an('object');
    }));

    //it( 'should provide a xxx method', inject( function(notificationCreationService) {
    //    expect(notificationCreationService.xxx).to.be.a('Function');
    //}));

});
