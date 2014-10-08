describe('The component gatherer', function () {
    beforeEach(module('carli.componentGatherer'));

    it('should provide a gatherer object', inject(function(componentGatherer) {
        expect(componentGatherer).to.be.an('object');
    }));

    it('should have a gather method', inject(function(componentGatherer) {
        expect(componentGatherer.gather).to.be.a('function');
    }));

    describe('componentGatherer.gather', function () {

        it('should return an array', inject(function(componentGatherer) {
            expect(componentGatherer.gather()).to.be.an('array');
        }));

    });
});
