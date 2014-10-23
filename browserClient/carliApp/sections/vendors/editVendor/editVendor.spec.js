var VendorPage = require('./VendorPage.spec');

describe('The new vendor screen', function () {
    var newVendorPage = new VendorPage();

    it('should be routed at /vendor/new', function(){
        browser.setLocation('/vendor/new');
    });

    it('should have a default name input field', function () {
        expect(newVendorPage.nameInput.isPresent()).toBe(true);
        expect(newVendorPage.nameInput.getTagName()).toBe('input');
        expect(newVendorPage.nameInput.getAttribute('value')).toBe('New Vendor');
    });

    it('should have a blank Website input field', function () {
        expect(newVendorPage.websiteInput.isPresent()).toBe(true);
        expect(newVendorPage.websiteInput.getTagName()).toBe('input');
        expect(newVendorPage.websiteInput.getAttribute('value')).toBe('');
    });

    it('should have a blank Comments textarea', function () {
        expect(newVendorPage.commentsInput.isPresent()).toBe(true);
        expect(newVendorPage.commentsInput.getTagName()).toBe('textarea');
        expect(newVendorPage.commentsInput.getAttribute('value')).toBe('');
    });

    it('should have a blank Admin Module textarea', function () {
        expect(newVendorPage.adminModuleInput.isPresent()).toBe(true);
        expect(newVendorPage.adminModuleInput.getTagName()).toBe('textarea');
        expect(newVendorPage.adminModuleInput.getAttribute('value')).toBe('');
    });

    it('should have a active / inactive control', function () {
        newVendorPage.statusInputs.then(function(items) {
            expect(items.length).toBe(2);
            expect(items[0].getAttribute('type')).toBe('radio');
            expect(items[1].getAttribute('type')).toBe('radio');
        });
    });

    it('should have "Add Contact" links for all three types of contacts', function () {
        expect(newVendorPage.addBillingContactLink.isPresent()).toBe(true);
        expect(newVendorPage.addBillingContactLink.getTagName()).toBe('a');
        expect(newVendorPage.addSalesContactLink.isPresent()).toBe(true);
        expect(newVendorPage.addSalesContactLink.getTagName()).toBe('a');
        expect(newVendorPage.addTechnicalContactLink.isPresent()).toBe(true);
        expect(newVendorPage.addTechnicalContactLink.getTagName()).toBe('a');
    });

    it('should add a new billing contact when the "Add Contact" for billing contacts is clicked', function () {
        element.all(by.tagName('contact-editor')).count().then(function (beforeCount) {
            newVendorPage.addBillingContactLink.click();

            var afterCount = element.all(by.tagName('contact-editor')).count().then(function (afterCount) {
                expect(afterCount == beforeCount + 1).toBe(true);
            });
        });
    });

/*
    it('should save a new Vendor when filling in the form and clicking save', function() {
        newVendorPage.nameInput.sendKeys( newVendorPage.testVendor.name );
    });
*/
});


xdescribe('The edit vendor screen', function () {

    it('should load the Vendors List screen', function() {
        browser.setLocation();
    });

    var editVendorPage = new VendorPage(); 

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
