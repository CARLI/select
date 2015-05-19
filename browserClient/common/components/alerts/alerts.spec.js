describe ('The Alerts module', function () {
    beforeEach(module('common.alerts'));

    it('should provide a service object', inject(function(alertService) {
        expect(alertService).to.be.an('Object');
    }));

    it('should have a putAlert method', inject(function(alertService) {
        expect(alertService.putAlert).to.be.a('Function');
    }));

    describe('alertService.putAlert', function () {
        it('should return an alert object', inject(function(alertService) {
            expect(alertService.putAlert("Test Alert")).to.be.an('Object');
        }));

        it('should return false when attempting to add an empty alert message', inject(function(alertService) {
            expect(alertService.putAlert()).to.equal(false);
        }));
    });

    it('should have a getAlerts method', inject(function(alertService) {
        expect(alertService.getAlerts).to.be.a('Function');
    }));

    describe('alertService.getAlerts', function () {
        it('should return the current list of alert objects', inject(function(alertService) {
            expect(alertService.getAlerts()).to.be.an('Array');
        }));

        it('should contain previously saved alerts', inject(function(alertService) {
            var alert = alertService.putAlert("Test Alert 2");
            expect(alertService.getAlerts().indexOf(alert)).to.be.above(-1);
        }));
    });

    it('should have a clearAlert method', inject(function(alertService) {
        expect(alertService.clearAlert).to.be.a('Function');
    }));

    describe('alertService.clearAlert', function () {
        it('should remove an alert object from the list', inject(function(alertService) {
            var alert = alertService.putAlert("Test Alert 3");
            expect(alertService.getAlerts().indexOf(alert)).to.be.above(-1);
            alertService.clearAlert(alert);
            expect(alertService.getAlerts().indexOf(alert)).to.equal(-1);
        }));
    });
});