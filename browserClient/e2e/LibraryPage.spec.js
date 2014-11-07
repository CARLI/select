var LibraryPage = function () {
    this.listFilterShowAll = element(by.cssContainingText('.ng-binding', 'All libraries'));

    this.nameInput = element(by.model('vm.library.name')).element(by.tagName('input'));
    this.nameDisplay = element(by.model('vm.library.name'));

    this.fteInput = element(by.model('vm.library.fte')).element(by.tagName('input'));
    this.fteDisplay = element(by.model('vm.library.fte'));

    this.institutionYearsInput = element(by.model('vm.library.institutionYears')).element(by.tagName('select'));
    this.institutionYersInputDisplay = element(by.model('vm.library.institutionYears'));

    this.institutionTypeInput = element(by.model('vm.library.institutionType')).element(by.tagName('select'));
    this.institutionTypeInputDisplay = element(by.model('vm.library.institutionType'));

    this.ipAddressInput = element(by.model('vm.library.ipAddresses')).element(by.tagName('textarea'));
    this.ipAddressnputDisplay = element(by.model('vm.library.ipAddresses'));

    this.membershipLevelInput = element(by.model('vm.library.membershipLevel')).element(by.tagName('select'));
    this.membershipLevelInputDisplay = element(by.model('vm.library.membershipLevel'));

    this.iShareInput = element(by.model('vm.library.isIshareMember')).element(by.tagName('input'));
    this.iShareInputDisplay = element(by.model('vm.library.isIshareMember'));

    this.garInput = element(by.model('vm.library.gar')).element(by.tagName('input'));
    this.garInputDisplay = element(by.model('vm.library.gar'));

    this.statusInputs = element.all(by.model('vm.library.isActive')).all(by.tagName('input'));
    this.statusInputDisplay = element(by.model('vm.library.isActive'));

    this.addDirectorContactLink = element(by.id('add-director-contact'));
    this.addEresourceLiaisonContactLink = element(by.id('add-e-resources-liaison-contact'));
    this.addOtherContactLink = element(by.id('add-other-contact'));
    this.addNotificationOnlyContactLink = element(by.id('add-notification-only-contact'));

    this.submit = element(by.id('library-submit'));

    this.editButton = element(by.id('library-edit'));

    /*
     * Clicks the radio button defined in testLibrary
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
        var contact = element(by.repeater("contact in vm.library.contacts | filter:{ contactType: '" + type + "' }").row(index));

        return {
            name: contact.all(by.exactBinding('contact.name')).get(0),
            email: contact.all(by.exactBinding('contact.email')).get(0),
            phoneNumber: contact.all(by.exactBinding('contact.phoneNumber')).get(0)
        };
    };
    this.getContactEditForm = function getContactEditForm(type, index) {
        var contact = element(by.repeater("contact in vm.library.contacts | filter:{ contactType: '" + type + "' }").row(index));

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

    this.addEmptyContacts = function addEmptyContacts ( libraryObject ) {
        for ( i = 0 ; i < libraryObject.directorContacts.length - 1 ; i++ ){
            this.addDirectorContactLink.click();
        }

        for ( i = 0 ; i < libraryObject.eResourceLiaisonContacts.length - 1 ; i++ ){
            this.addEresourceLiaisonContactLink.click();
        }

        for ( i = 0 ; i < libraryObject.otherContacts.length - 1 ; i++ ){
            this.addOtherContactLink.click();
        }

        for ( i = 0 ; i < libraryObject.notificationOnlyContacts.length - 1 ; i++ ){
            this.addNotificationOnlyContactLink.click();
        }

    };

    this.fillInLibrary = function fillInLibraryForm ( libraryObject ){

        this.nameInput.clear();
        this.nameInput.sendKeys(libraryObject.name);

        this.fteInput.clear();
        this.fteInput.sendKeys(libraryObject.fte);

        this.institutionYearsInput.element(by.cssContainingText('option', libraryObject.institutionYears )).click();

        this.institutionTypeInput.element(by.cssContainingText('option', libraryObject.institutionType )).click();

        this.ipAddressInput.clear();
        this.ipAddressInput.sendKeys(libraryObject.ipAddresses);

        this.membershipLevelInput.element(by.cssContainingText('option', libraryObject.membershipLevel )).click();

        //TODO: this should depend on the value from the test data
        this.iShareInput.click();

        this.garInput.clear();
        this.garInput.sendKeys(libraryObject.gar);

        this.clickStatusInput(libraryObject.isActive);

        for ( i = 0 ; i < libraryObject.directorContacts.length ; i++ ){
            contact = this.getContactEditForm('Director',i);
            testData = libraryObject.directorContacts[i];

            this.fillInContact( contact, testData );
        }

        for ( i = 0 ; i < libraryObject.eResourceLiaisonContacts.length ; i++ ){
            contact = this.getContactEditForm('E-Resources Liaison',i);
            testData = libraryObject.eResourceLiaisonContacts[i];

            this.fillInContact( contact, testData );
        }

        for ( i = 0 ; i < libraryObject.otherContacts.length ; i++ ){
            contact = this.getContactEditForm('Other',i);
            testData = libraryObject.otherContacts[i];

            this.fillInContact( contact, testData );
        }

        for ( i = 0 ; i < libraryObject.notificationOnlyContacts.length ; i++ ){
            contact = this.getContactEditForm('Notification Only',i);
            testData = libraryObject.notificationOnlyContacts[i];

            this.fillInContact( contact, testData );
        }
    };


    this.testLibrary = {
        name: 'Test Library 1',
        fte: 1000,
        institutionYears: '2 Year',
        institutionType: 'Public',
        ipAddresses: '192.168.0.1',
        membershipLevel: 'Governing',
        isIshareMember: true,
        gar: 'Test Gar Value',
        isActive: false,
        directorContacts: [
            {
                name: 'Director Contact 1',
                email:'director1@example.com',
                phoneNumber:'123-4567'
            },
            {
                name: 'Director Contact 2',
                email:'director1@example.com',
                phoneNumber:'890-4567'
            }
        ],
        eResourceLiaisonContacts: [
            {
                name: 'Liaison Contact 1',
                email:'liaison@exmaple.com',
                phoneNumber:'234-5678'
            }
        ],
        otherContacts: [
            {
                name: 'Other Contact 1',
                email:'other@example.com',
                phoneNumber:'345-6789'
            }
        ],
        notificationOnlyContacts: [
            {
                name: 'Billing Contact 1',
                email:'billing@example.com',
                phoneNumber:'345-6789'
            }
        ]
    };

    this.testEditLibrary = {
        name: 'Test Library Edit 1',
        fte: 1001,
        institutionYears: '4 Year',
        institutionType: 'Private',
        ipAddresses: '192.168.1.1',
        membershipLevel: 'Affiliate',
        isIshareMember: true,
        gar: 'Test Gar Value',
        isActive: false,
        directorContacts: [
            {
                name: 'Edited Director Contact 1',
                email:'director1.edit@example.com',
                phoneNumber:'123-4567'
            },
            {
                name: 'Edited Director Contact 2',
                email:'director1.edit@example.com',
                phoneNumber:'123-4567'
            }
        ],
        eResourceLiaisonContacts: [
            {
                name: 'Edited Liaison Contact 1',
                email:'liaison.edit@exmaple.com',
                phoneNumber:'345-5678'
            }
        ],
        otherContacts: [
            {
                name: 'Edited Other Contact 1',
                email:'other.edit@example.com',
                phoneNumber:'346-6789'
            }
        ],
        notificationOnlyContacts: [
            {
                name: 'Edited Billing Contact 1',
                email:'billing.edit@example.com',
                phoneNumber:'347-6789'
            }
        ]
    };
};

module.exports = LibraryPage;
