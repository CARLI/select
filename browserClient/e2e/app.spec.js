var ip = require('ip');
var devServerUrl = 'http://' + ip.address() + ':8000';

var CarliApp = function () {
    this.navBar = {
        dashboard: element(by.id('nav-dashboard')),
        vendors: element(by.id('nav-vendors')),
        styleGuide: element(by.id('nav-style-guide'))
    };  
        
    this.getDefaultAppPage = function () {
        browser.get(devServerUrl);
    };
};

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

    //This might belong in a file called 'app.dev.spec.js'
    it('should have a Style Guide link in the navBar', function() {
        expect(carliApp.navBar.styleGuide.isPresent()).toBe(true);
        expect(carliApp.navBar.styleGuide.getTagName()).toBe('a');
    });
});
