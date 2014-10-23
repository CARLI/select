var VendorPage = function () {
    this.nameInput = element(by.model('vm.vendor.name'));
    this.websiteInput = element(by.model('vm.vendor.websiteUrl'));
    this.commentsInput = element(by.model('vm.vendor.comments'));
    this.adminModuleInput = element(by.model('vm.vendor.adminModule'));
    this.statusInputs = element.all(by.model('vm.vendor.isActive'));
    this.addBillingContactLink = element(by.id('add-billing-contact'));
    this.addSalesContactLink = element(by.id('add-sales-contact'));
    this.addTechnicalContactLink = element(by.id('add-technical-contact'));

    this.getContact = function getContact( type, index ){
        var contact = element(by.repeater("contact in vm.vendor.contacts | filter:{ contactType: '"+type+"' }").row(index));

        return {
            name:  contact.all(by.model('contact.name')).get(0),
            email: contact.all(by.model('contact.email')).get(0),
            phoneNumber: contact.all(by.model('contact.phoneNumber')).get(0)
        };
    };

    this.fillInContact = function fillInContact( contactElement, contactData ){
        contactElement.name.sendKeys( contactData.name );
        contactElement.email.sendKeys( contactData.email );
        contactElement.phoneNumber.sendKeys( contactData.phoneNumber );
    };

    this.testVendor = {
        name: 'Test Vendor 1',
        website: 'http://www.example.com',
        comments: 'This is a comment',
        adminModule: 'This is an admin module comment',
        active: true,
        billingContacts: [
            {
                name: 'Billing Contact 1',
                email:'billing1@example.com',
                phoneNumber:'123-4567'
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
};

module.exports = VendorPage;
