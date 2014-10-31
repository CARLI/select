var VendorPage = function () {
    this.listFilterShowAll = element(by.cssContainingText('.ng-binding', 'All vendors'));

    this.nameInput = element(by.model('vm.vendor.name')).element(by.tagName('input'));
    this.nameDisplay = element(by.model('vm.vendor.name'));
    this.websiteInput = element(by.model('vm.vendor.websiteUrl'));
    this.commentsInput = element(by.model('vm.vendor.comments'));
    this.adminModuleInput = element(by.model('vm.vendor.adminModule'));
    this.statusInputs = element.all(by.model('vm.vendor.isActive'));
    this.addBillingContactLink = element(by.id('add-billing-contact'));
    this.addSalesContactLink = element(by.id('add-sales-contact'));
    this.addTechnicalContactLink = element(by.id('add-technical-contact'));
    this.submit = element(by.id('vendor-submit'));
    this.editButton = element(by.id('vendor-edit'));

    /*
     * Clicks the radio button defined in testVendor
     */

    this.clickStatusInput = function clickStatusInput(isActive) {
        var radios = this.statusInputs;

        if (isActive) {
            radios.get(0).click();
        } else {
            radios.get(1).click();
        }
    };

    this.getStatusInputActive = function getStatusInputActive() {
        // returns string 'true' if active is selected -or- NULL if not
        return this.statusInputs.get(0).getAttribute('checked');
    };

    this.getContactViewElement = function getContactViewElement(type, index) {
        var contact = element(by.repeater("contact in vm.vendor.contacts | filter:{ contactType: '" + type + "' }").row(index));

        return {
            name: contact.all(by.exactBinding('contact.name')).get(0),
            email: contact.all(by.exactBinding('contact.email')).get(0),
            phoneNumber: contact.all(by.exactBinding('contact.phoneNumber')).get(0)
        };
    };
    this.getContactEditForm = function getContactEditForm(type, index) {
        var contact = element(by.repeater("contact in vm.vendor.contacts | filter:{ contactType: '" + type + "' }").row(index));

        return {
            name: contact.all(by.model('contact.name')).get(0),
            email: contact.all(by.model('contact.email')).get(0),
            phoneNumber: contact.all(by.model('contact.phoneNumber')).get(0)
        };
    };

    this.fillInContact = function fillInContact( contactElement, contactData ){
        contactElement.name.clear();
        contactElement.name.sendKeys( contactData.name );

        contactElement.email.clear();
        contactElement.email.sendKeys( contactData.email );

        contactElement.phoneNumber.clear();
        contactElement.phoneNumber.sendKeys( contactData.phoneNumber );
    };

    this.fillInVendor = function fillInVendorForm ( vendorObject ){

        this.nameInput.clear();
        this.nameInput.sendKeys(vendorObject.name);
        this.websiteInput.clear();
        this.websiteInput.sendKeys(vendorObject.websiteUrl);
        this.commentsInput.clear();
        this.commentsInput.sendKeys(vendorObject.comments);
        this.adminModuleInput.clear();
        this.adminModuleInput.sendKeys(vendorObject.adminModule);

        this.clickStatusInput(vendorObject.isActive);

        for ( i = 0 ; i < vendorObject.billingContacts.length ; i++ ){
            this.addBillingContactLink.click();

            contact = this.getContactEditForm('Billing',i);
            testData = vendorObject.billingContacts[i];

            this.fillInContact( contact, testData );
        }

        for ( i = 0 ; i < vendorObject.salesContacts.length ; i++ ){
            this.addSalesContactLink.click();

            contact = this.getContactEditForm('Sales',i);
            testData = vendorObject.salesContacts[i];

            this.fillInContact( contact, testData );
        }

        for ( i = 0 ; i < vendorObject.technicalContacts.length ; i++ ){
            this.addTechnicalContactLink.click();

            contact = this.getContactEditForm('Technical',i);
            testData = vendorObject.technicalContacts[i];

            this.fillInContact( contact, testData );
        }
    };


    this.testVendor = {
        name: 'Test Vendor 1',
        websiteUrl: 'http://www.example.com',
        comments: 'This is a comment',
        adminModule: 'This is an admin module comment',
        isActive: false,
        billingContacts: [
            {
                name: 'Billing Contact 1',
                email:'billing1@example.com',
                phoneNumber:'123-4567'
            },
            {
                name: 'Billing Contact 2',
                email:'billing2@example.com',
                phoneNumber:'890-4567'
            }
        ],
        salesContacts: [
            {
                name: 'Sales Contact 1',
                email:'sales@exmaple.com',
                phoneNumber:'234-5678'
            }
        ],
        technicalContacts: [
            {
                name: 'Technical Contact 1',
                email:'tech@example.com',
                phoneNumber:'345-6789'
            }
        ]
    };

    this.testEditVendor = {
        name: 'Change Vendor Name',
        websiteUrl: 'http://www.example.net',
        comments: 'This is an edited comment',
        adminModule: 'This is an edited admin module comment',
        isActive: true,
        billingContacts: [
            {
                name: 'Billing Contact 1 - Edited',
                email:'billing1.edit@example.com',
                phoneNumber:'217-4567'
            },
            {
                name: 'Billing Contact 2 - Edited',
                email:'billing2.edit@example.com',
                phoneNumber:'217-4567'
            }
        ],
        salesContacts: [
            {
                name: 'Sales Contact 1 - Edited',
                email:'sales.edit@exmaple.com',
                phoneNumber:'217-5678'
            }
        ],
        technicalContacts: [
            {
                name: 'Technical Contact 1 - Edited',
                email:'tech.edit@example.com',
                phoneNumber:'217-6789'
            }
        ]
    };
};

module.exports = VendorPage;
