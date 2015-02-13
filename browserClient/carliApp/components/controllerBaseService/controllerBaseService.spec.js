describe('The controller Base Service', function() {
    beforeEach(module('carli.controllerBaseService'));

    it('should provide controllerBaseService', inject(function (controllerBaseService) {
        expect(controllerBaseService).to.be.an('object');
    }));

    it('should provide the controller active/inactive status options', inject(function (controllerBaseService) {
        expect(controllerBaseService.addSortable).to.be.a('function');
    }));

    it('should add a sort function and sorting properties to the object passed in', inject(function(controllerBaseService){
        var testObject = {};
        controllerBaseService.addSortable(testObject, 'defaultSort');
        expect(testObject.sort).to.be.a('function');
        expect(testObject.orderBy).to.equal('defaultSort');
        expect(testObject.reverse).to.equal(false);
    }));
});

