var VendorPage = require('./VendorPage.spec');

describe('The New Vendor screen', function () {
    var vendorPage = new VendorPage();

    it('should be routed at /vendor/new', function(){
        browser.setLocation('/vendor/new');
    });

    it('should have a default name input field', function () {
        expect(vendorPage.nameInput.isPresent()).toBe(true);
        expect(vendorPage.nameInput.getTagName()).toBe('input');
        expect(vendorPage.nameInput.getAttribute('value')).toBe('New Vendor');
    });

    it('should have a blank Website input field', function () {
        expect(vendorPage.websiteInput.isPresent()).toBe(true);
        expect(vendorPage.websiteInput.getTagName()).toBe('input');
        expect(vendorPage.websiteInput.getAttribute('value')).toBe('');
    });

    it('should have a blank Comments textarea', function () {
        expect(vendorPage.commentsInput.isPresent()).toBe(true);
        expect(vendorPage.commentsInput.getTagName()).toBe('textarea');
        expect(vendorPage.commentsInput.getAttribute('value')).toBe('');
    });

    it('should have a blank Admin Module textarea', function () {
        expect(vendorPage.adminModuleInput.isPresent()).toBe(true);
        expect(vendorPage.adminModuleInput.getTagName()).toBe('textarea');
        expect(vendorPage.adminModuleInput.getAttribute('value')).toBe('');
    });

    it('should have a active / inactive control', function () {
        vendorPage.statusInputs.then(function(items) {
            expect(items.length).toBe(2);
            expect(items[0].getAttribute('type')).toBe('radio');
            expect(items[1].getAttribute('type')).toBe('radio');
        });
    });

    it('should have "Add Contact" links for all three types of contacts', function () {
        expect(vendorPage.addBillingContactLink.isPresent()).toBe(true);
        expect(vendorPage.addBillingContactLink.getTagName()).toBe('a');
        expect(vendorPage.addSalesContactLink.isPresent()).toBe(true);
        expect(vendorPage.addSalesContactLink.getTagName()).toBe('a');
        expect(vendorPage.addTechnicalContactLink.isPresent()).toBe(true);
        expect(vendorPage.addTechnicalContactLink.getTagName()).toBe('a');
    });

    it('should add a new billing contact when the "Add Contact" for billing contacts is clicked', function () {
        element.all(by.tagName('contact-editor')).count().then(function (beforeCount) {
            vendorPage.addBillingContactLink.click();

            var afterCount = element.all(by.tagName('contact-editor')).count().then(function (afterCount) {
                expect(afterCount == beforeCount + 1).toBe(true);
            });
        });
    });

    it('should save a new Vendor when filling in the form and clicking save', function() {
        var i, contact, testData, vendorList;
        var fillInContact = vendorPage.fillInContact;

        vendorPage.nameInput.clear();
        vendorPage.nameInput.sendKeys( vendorPage.testVendor.name );
        expect( vendorPage.nameInput.getAttribute('value')).toBe( vendorPage.testVendor.name );

        vendorPage.websiteInput.sendKeys( vendorPage.testVendor.website );
        vendorPage.commentsInput.sendKeys( vendorPage.testVendor.comments );
        vendorPage.adminModuleInput.sendKeys( vendorPage.testVendor.adminModule );

        vendorPage.statusInputs.get(0).click();

        for ( i = 0 ; i < vendorPage.testVendor.billingContacts.length ; i++ ){
            vendorPage.addBillingContactLink.click();

            contact = vendorPage.getContact('Billing',i);
            testData = vendorPage.testVendor.billingContacts[i];

            fillInContact( contact, testData );
        }

        for ( i = 0 ; i < vendorPage.testVendor.salesContacts.length ; i++ ){
            vendorPage.addSalesContactLink.click();

            contact = vendorPage.getContact('Sales',i);
            testData = vendorPage.testVendor.salesContacts[i];

            fillInContact( contact, testData );
        }

        for ( i = 0 ; i < vendorPage.testVendor.technicalContacts.length ; i++ ){
            vendorPage.addTechnicalContactLink.click();

            contact = vendorPage.getContact('Technical',i);
            testData = vendorPage.testVendor.technicalContacts[i];

            fillInContact( contact, testData );
        }

        vendorPage.submit.click();

        element.all(by.repeater('vendor in vm.vendorList'))
        .filter( function(el, index) {
            return el.getText().then(function(text){
                return text === vendorPage.testVendor.name;
            });
        })
        .then( function( vendorList ) {
            expect( vendorList.length ).toBe(1);
        });
    });

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
