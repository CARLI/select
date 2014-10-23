
var CarliApp = require('./CarliApp.spec');

describe('The CARLI App', function() {
    var carliApp = new CarliApp();
    carliApp.getDefaultAppPage();

    it('should have a Dashboard link in the navBar', function() {
        expect(carliApp.navBar.dashboard.isPresent()).toBe(true);
        expect(carliApp.navBar.dashboard.getTagName()).toBe('a');
        //expect(carliApp.navBar.dashboard.getAttribute('href')).toBe('/dashboard');
    });

    it('should have a Vendors link in the navBar', function() {
        expect(carliApp.navBar.vendors.isPresent()).toBe(true);
        expect(carliApp.navBar.vendors.getTagName()).toBe('a');
    });

});
