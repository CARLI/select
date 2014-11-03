var VendorPage = require('./VendorPage.spec');

describe('The New Vendor screen', function () {
    var vendorPage = new VendorPage();

    it('should be routed at /vendor/new', function(){
        browser.setLocation('/vendor/new');
    });

    it('should have a default name input field', function () {
        expect(vendorPage.nameInput.isPresent()).toBe(true);
        expect(vendorPage.nameInput.getTagName()).toBe('input');
        expect(vendorPage.nameInput.getAttribute('value')).toBe('');
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

    it('should save a new Vendor when filling in the form and clicking save', function() {
        var i, contact, testData, vendorList;

        vendorPage.fillInVendor( vendorPage.testVendor );

        vendorPage.submit.click();

        vendorPage.listFilterShowAll.click();

        element.all(by.repeater('vendor in vm.vendorList'))
        .filter( function(el, index) {
            return el.getText().then(function(text){
                return (text.search(vendorPage.testVendor.name) > -1);
            });
        })
        .then( function( vendorList ) {
            expect( vendorList.length ).toBe(1);
        });
    });

});


describe('Viewing an existing Vendor in read only mode', function () {
    var vendorPage = new VendorPage();

    it('should be routed to the screen for the test vendor', function () {

        //Don't need to call these as long as the previous test left us on the list page with 'All' showing
        //browser.setLocation('/vendor');
        //vendorPage.listFilterShowAll.click();

        element.all(by.repeater('vendor in vm.vendorList'))
            .filter(function (el, index) {
                return el.getText().then(function (text) {
                    return (text.search(vendorPage.testVendor.name) > -1);
                });
            })
            .then(function (vendorList) {
                vendorList[0].element(by.tagName('a')).click();
            });
    });


    it('should not have an editable name field', function() {
        expect(vendorPage.nameInput.isDisplayed()).toBe(false);
    });

    it('should not have an editable websiteUrl field', function() {
        expect(vendorPage.websiteInput.isDisplayed()).toBe(false);
    });

    it('should not have an editable comments textarea', function() {
        expect(vendorPage.commentsInput.isDisplayed()).toBe(false);
    });

    it('should not have an editable adminModule textarea', function() {
        expect(vendorPage.adminModuleInput.isDisplayed()).toBe(false);
    });

//    it('should not have editable Vendor Status radio buttons');

    it('should not display editable Contact fields', function() {
        var contactForm;
        for ( i = 0 ; i < vendorPage.testVendor.billingContacts.length ; i++ ) {
            contactForm = vendorPage.getContactEditForm('Billing', i);
            expect(contactForm.name.isDisplayed()).toBe(false);
            expect(contactForm.phoneNumber.isDisplayed()).toBe(false);
            expect(contactForm.email.isDisplayed()).toBe(false);
        }
        for ( i = 0 ; i < vendorPage.testVendor.technicalContacts.length ; i++ ) {
            contactForm = vendorPage.getContactEditForm('Technical', i);
            expect(contactForm.name.isDisplayed()).toBe(false);
            expect(contactForm.phoneNumber.isDisplayed()).toBe(false);
            expect(contactForm.email.isDisplayed()).toBe(false);
        }
        for ( i = 0 ; i < vendorPage.testVendor.salesContacts.length ; i++ ) {
            contactForm = vendorPage.getContactEditForm('Sales', i);
            expect(contactForm.name.isDisplayed()).toBe(false);
            expect(contactForm.phoneNumber.isDisplayed()).toBe(false);
            expect(contactForm.email.isDisplayed()).toBe(false);
        }
    });

    it('should display name', function() {
        vendorPage.nameDisplay.getText().then(function (text) {
            expect(text).toBe(vendorPage.testVendor.name);
        });
    });

    it('should display websiteUrl', function() {
        vendorPage.websiteDisplay.getText().then(function (text) {
            expect(text).toBe(vendorPage.testVendor.websiteUrl);
        });
    });

    it('should display comments', function() {
        vendorPage.commentsInputDisplay.getText().then(function (text) {
            expect(text).toBe(vendorPage.testVendor.comments);
        });
    });

    it('should display adminModule', function() {
        vendorPage.adminModuleInputDisplay.getText().then(function (text) {
            expect(text).toBe(vendorPage.testVendor.adminModule);
        });
    });

//    it('should display the Vendor Status');

    it('should display Contacts', function() {
        var contactElement;
        for ( i = 0 ; i < vendorPage.testVendor.billingContacts.length ; i++ ) {
            contactElement = vendorPage.getContactViewElement('Billing', i);
            expect(contactElement.name.isDisplayed()).toBe(true);
            expect(contactElement.phoneNumber.isDisplayed()).toBe(true);
            expect(contactElement.email.isDisplayed()).toBe(true);
        }
        for ( i = 0 ; i < vendorPage.testVendor.technicalContacts.length ; i++ ) {
            contactElement = vendorPage.getContactViewElement('Technical', i);
            expect(contactElement.name.isDisplayed()).toBe(true);
            expect(contactElement.phoneNumber.isDisplayed()).toBe(true);
            expect(contactElement.email.isDisplayed()).toBe(true);
        }
        for ( i = 0 ; i < vendorPage.testVendor.salesContacts.length ; i++ ) {
            contactElement = vendorPage.getContactViewElement('Sales', i);
            expect(contactElement.name.isDisplayed()).toBe(true);
            expect(contactElement.phoneNumber.isDisplayed()).toBe(true);
            expect(contactElement.email.isDisplayed()).toBe(true);
        }
    });
});

describe('Viewing an existing Vendor in edit mode', function () {
    var vendorPage = new VendorPage();

    it('should have a populated name field', function() {
        expect(vendorPage.nameInput.getAttribute('value')).toBe(vendorPage.testVendor.name);
    });

    it('should have a populated website field', function() {
        expect(vendorPage.websiteInput.getAttribute('value')).toBe(vendorPage.testVendor.websiteUrl);
    });

    it('should have a populated comments field', function() {
        expect(vendorPage.commentsInput.getAttribute('value')).toBe(vendorPage.testVendor.comments);
    });

    it('should have a populated admin module comment field', function() {
        expect(vendorPage.adminModuleInput.getAttribute('value')).toBe(vendorPage.testVendor.adminModule);
    });

    it('should have a correctly selected Vendor Status radio button', function() {
       expect(vendorPage.getStatusInputActive()).toBe(vendorPage.testVendor.isActive ? 'true' : null);
    });

    it('should have correctly filled in Contact fields', function(){
        var contactForm, contact;

        for ( i = 0 ; i < vendorPage.testVendor.billingContacts.length ; i++ ){
            contactForm = vendorPage.getContactEditForm('Billing', i);
            contact = vendorPage.testVendor.billingContacts[i];
            expect(contactForm.name.getAttribute('value')).toBe(contact.name);
            expect(contactForm.email.getAttribute('value')).toBe(contact.email);
            expect(contactForm.phoneNumber.getAttribute('value')).toBe(contact.phoneNumber);
        }

        for ( i = 0 ; i < vendorPage.testVendor.salesContacts.length ; i++ ){
            contactForm = vendorPage.getContactEditForm('Sales', i);
            contact = vendorPage.testVendor.salesContacts[i];
            expect(contactForm.name.getAttribute('value')).toBe(contact.name);
            expect(contactForm.email.getAttribute('value')).toBe(contact.email);
            expect(contactForm.phoneNumber.getAttribute('value')).toBe(contact.phoneNumber);
        }

        for ( i = 0 ; i < vendorPage.testVendor.technicalContacts.length ; i++ ){
            contactForm = vendorPage.getContactEditForm('Technical', i);
            contact = vendorPage.testVendor.technicalContacts[i];
            expect(contactForm.name.getAttribute('value')).toBe(contact.name);
            expect(contactForm.email.getAttribute('value')).toBe(contact.email);
            expect(contactForm.phoneNumber.getAttribute('value')).toBe(contact.phoneNumber);
        }
    });
});

describe('Making changes to an existing Vendor', function(){
    var vendorPage = new VendorPage();

    it('should change the entry on the Vendor list screen when changing the name', function () {
        browser.setLocation('/vendor');

        vendorPage.listFilterShowAll.click();

        element.all(by.repeater('vendor in vm.vendorList'))
            .filter(function (el, index) {
                return el.getText().then(function (text) {
                    return (text.search(vendorPage.testVendor.name) > -1);
                });
            })
            .then(function (vendorList) {
                vendorList[0].element(by.tagName('a')).click();
            });

        vendorPage.editButton.click();

        vendorPage.fillInVendor( vendorPage.testEditVendor );

        vendorPage.submit.click();

        vendorPage.listFilterShowAll.click();

        element.all(by.repeater('vendor in vm.vendorList'))
            .filter(function (el, index) {
                return el.getText().then(function (text) {
                    return (text.search(vendorPage.testEditVendor.name) > -1);
                });
            })
            .then(function (vendorList) {
                expect( vendorList.length ).toBe(1);
                vendorList[0].element(by.tagName('a')).click();
            });
    });

    it('should save changes to the name field', function() {
        expect(vendorPage.nameInput.getAttribute('value')).toBe(vendorPage.testEditVendor.name);
    });

    it('should save changes to the websiteUrl field', function() {
        expect(vendorPage.websiteInput.getAttribute('value')).toBe(vendorPage.testEditVendor.websiteUrl);
    });

    it('should save changes to the comments field', function() {
        expect(vendorPage.commentsInput.getAttribute('value')).toBe(vendorPage.testEditVendor.comments);
    });

    it('should save changes to the adminModule field', function() {
        expect(vendorPage.adminModuleInput.getAttribute('value')).toBe(vendorPage.testEditVendor.adminModule);
    });

    it('should save changes to the isActive field', function() {
        expect(vendorPage.getStatusInputActive()).toBe(vendorPage.testEditVendor.isActive ? 'true' : null);
    });

    it('should save changes to the Contacts', function() {
        var contactForm, contact;

        for ( i = 0 ; i < vendorPage.testEditVendor.billingContacts.length ; i++ ){
            contactForm = vendorPage.getContactEditForm('Billing', i);
            contact = vendorPage.testEditVendor.billingContacts[i];
            expect(contactForm.name.getAttribute('value')).toBe(contact.name);
            expect(contactForm.email.getAttribute('value')).toBe(contact.email);
            expect(contactForm.phoneNumber.getAttribute('value')).toBe(contact.phoneNumber);
        }

        for ( i = 0 ; i < vendorPage.testEditVendor.salesContacts.length ; i++ ){
            contactForm = vendorPage.getContactEditForm('Sales', i);
            contact = vendorPage.testEditVendor.salesContacts[i];
            expect(contactForm.name.getAttribute('value')).toBe(contact.name);
            expect(contactForm.email.getAttribute('value')).toBe(contact.email);
            expect(contactForm.phoneNumber.getAttribute('value')).toBe(contact.phoneNumber);
        }

        for ( i = 0 ; i < vendorPage.testEditVendor.technicalContacts.length ; i++ ){
            contactForm = vendorPage.getContactEditForm('Technical', i);
            contact = vendorPage.testEditVendor.technicalContacts[i];
            expect(contactForm.name.getAttribute('value')).toBe(contact.name);
            expect(contactForm.email.getAttribute('value')).toBe(contact.email);
            expect(contactForm.phoneNumber.getAttribute('value')).toBe(contact.phoneNumber);
        }
    });
});
