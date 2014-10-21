var ip = require('ip');
var devServerUrl = 'http://' + ip.address() + ':8000';

var EditVendorPage = function () {
    this.nameInput = element(by.model('vm.vendor.name'));
    this.websiteInput = element(by.model('vm.vendor.websiteUrl'));
    this.commentsInput = element(by.model('vm.vendor.comments'));
    this.adminModuleInput = element(by.model('vm.vendor.adminModule'));
    this.statusInputs = element.all(by.model('vm.vendor.isActive'));

    this.get = function () {
        browser.get(devServerUrl + '/vendor/0');
    };
};

/**
 * These depend on the static JSON as it currently exists. Change to match real fixture data when it is ready..
 */
describe('The edit vendor screen', function() {
    var editVendorPage = new EditVendorPage(); 

    beforeEach( function(){
        editVendorPage.get();
    });

    it('should have a populated name field', function() {
        expect(editVendorPage.nameInput.getAttribute('value')).toBe('vendor0');
    });

    it('should have a populated website field', function() {
        expect(editVendorPage.websiteInput.getAttribute('value')).toBe('http://www.example.com');
    }); 

    it('should have a populated comments field', function() {
        expect(editVendorPage.commentsInput.getAttribute('value')).toBe('This is a comment');
    }); 

    it('should have a populated admin module comment field', function() {
        expect(editVendorPage.adminModuleInput.getAttribute('value')).toBe('This is an Admin Module comment');
    }); 
});
