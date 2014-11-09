var macro = require('./protractorMacros');
var LibraryPage = require('./LibraryPage.spec');

toString = macro.toString;

/**
 * The configuration below is used by the macros to generate tests. They take the following form:
 * propertyName should match the schema
 *
 * propertyName: {
 *       type: the input type (tag name) or 'contact' for a list of contacts
 *       description: how the form field will appear in test descriptions
 *       model: the value of the ng-model attribute used to bind the input to the Controller
 *       contactType: only for type 'contact' - which 'filter' value is used to get the list of contacts
 *       value1: the value used when creating the test entity
 *       value2: the value used when testing editing the entity
 *       valueToIndex: for radio buttons, tells which value (label) maps to which button (by index)
 * }
 */
var libraryTestConfig = {
    name: {
        type: 'input',
        description: 'Name',
        model: 'vm.library.name',
        value1: 'New Test Library 1',
        value2: 'New Test Library Edit 1'
    },
    fte: {
        type: 'input',
        description: 'Full Time Enrollment',
        model: 'vm.library.fte',
        value1: 1000,
        value2: 10001
    },
    institutionYears: {
        type: 'select',
        description: 'Institution Years',
        model: 'vm.library.institutionYears',
        value1: '2 Year',
        value2: '4 Year'
    },
    institutionType: {
        type: 'select',
        description: 'Institution Type',
        model: 'vm.library.institutionType',
        value1: 'Public',
        value2: 'Private'
    },
    ipAddresses: {
        type: 'textarea',
        description: 'IP Adresses',
        model: 'vm.library.ipAddresses',
        value1: '192.168.0.1',
        value2: '192.168.0.2'
    },
    membershipLevel: {
        type: 'select',
        description: 'Membership Level',
        model: 'vm.library.membershipLevel',
        value1: 'Governing',
        value2: 'Affiliate'
    },
    isIshareMember: {
        type: 'checkbox',
        description: 'iShare',
        model: 'vm.library.isIshareMember',
        value1: true,
        value2: false
    },
    gar: {
        type: 'input',
        description: 'GAR',
        model: 'vm.library.gar',
        value1: 'Test GAR Value',
        value2: 'Test Edit GAR Value'
    },
    isActive: {
        type: 'radio',
        description: 'isActive',
        model: 'vm.library.isActive',
        value1: 'Inactive',
        value2: 'Active',
        valueToIndex: {
            'Inactive': 0,
            'Active': 1
        }
    },
    directorContacts: {
        type: 'contact',
        description: 'Director Contacts',
        model: 'vm.library.contacts',
        contactType: 'Director',
        value1: [
            {
                name: 'Director Contact 1',
                email: 'director1@example.com',
                phoneNumber: '123-4567'
            },
            {
                name: 'Director Contact 2',
                email: 'director1@example.com',
                phoneNumber: '890-4567'
            }
        ],
        value2: [
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
        ]
    },
    eResourceLiaisonContacts: {
        type: 'contact',
        description: 'E-Resource Liaison Contacts',
        model: 'vm.library.contacts',
        contactType: 'E-Resources Liaison',
        value1: [
            {
                name: 'Liaison Contact 1',
                email: 'liaison@exmaple.com',
                phoneNumber: '234-5678'
            }
        ],
        value2: [
            {
                name: 'Edited Liaison Contact 1',
                email:'liaison.edit@exmaple.com',
                phoneNumber:'345-5678'
            }
        ]
    },
    otherContacts: {
        type: 'contact',
        description: 'Other Contacts',
        model: 'vm.library.contacts',
        contactType: 'Other',
        value1: [
            {
                name: 'Other Contact 1',
                email: 'other@example.com',
                phoneNumber: '345-6789'
            }
        ],
        value2: [
            {
                name: 'Edited Other Contact 1',
                email:'other.edit@example.com',
                phoneNumber:'346-6789'
            }
        ]
    },
    notificationOnlyContacts: {
        type: 'contact',
        description: 'Notification Only Contacts',
        model: 'vm.library.contacts',
        contactType: 'Notification Only',
        value1: [
            {
                name: 'Billing Contact 1',
                email: 'billing@example.com',
                phoneNumber: '345-6789'
            }
        ],
        value2: [
            {
                name: 'Edited Billing Contact 1',
                email:'billing.edit@example.com',
                phoneNumber:'347-6789'
            }
        ]
    }
};

describe('The New Library screen', function () {
    var libraryPage = new LibraryPage();

    it('should be routed at /library/new', function(){
        browser.setLocation('/library/new');
    });

    for ( var formElement in libraryTestConfig ){
        macro.ensureFormElementIsPresentAndBlank( libraryTestConfig[formElement] );
    }

    it('should have "Add Contact" links for all four types of users', function () {
        expect(libraryPage.addDirectorContactLink.isPresent()).toBe(true);
        expect(libraryPage.addEresourceLiaisonContactLink.isPresent()).toBe(true);
        expect(libraryPage.addOtherContactLink.isPresent()).toBe(true);
        expect(libraryPage.addNotificationOnlyContactLink.isPresent()).toBe(true);
    });
});

describe('Creating a New Library', function(){
    it('should save a new Library when filling in the form and clicking save', function() {
        var libraryPage = new LibraryPage();

        libraryPage.addEmptyContacts( libraryPage.testLibrary );
        libraryPage.fillInLibrary( libraryPage.testLibrary );

        libraryPage.submit.click();

        libraryPage.listFilterShowAll.click();

        element.all(by.repeater('entity in values'))
        .filter( function(el, index) {
            return el.getText().then(function(text){
                return (text.search(libraryPage.testLibrary.name) > -1);
            });
        })
        .then( function( libraryList ) {
            expect( libraryList.length ).toBe(1);
        });
    });
});

describe('Viewing an existing Library in read only mode', function () {
    var libraryPage = new LibraryPage();
    var formElement;

    it('should be routed to the screen for the test library', function () {

        //Don't need to call these as long as the previous test left us on the list page with 'All' showing
        //browser.setLocation('/library');
        //libraryPage.listFilterShowAll.click();

        element.all(by.repeater('entity in values'))
            .filter(function (el, index) {
                return el.getText().then(function (text) {
                    return (text.search(libraryPage.testLibrary.name) > -1);
                });
            })
            .then(function (libraryList) {
                libraryList[0].element(by.tagName('a')).click();
            });
    });

    for ( formElement in libraryTestConfig ){
        macro.ensureFormElementIsHidden( libraryTestConfig[formElement] );
    }

    for ( formElement in libraryTestConfig ){
        config = libraryTestConfig[formElement];
        macro.ensureFormElementDisplaysText( config, config.value1 );
    }

    it('should display Contacts', function() {
        var contactElement;
        for ( i = 0 ; i < libraryPage.testLibrary.directorContacts.length ; i++ ) {
            contactElement = libraryPage.getContactViewElement('Director', i);
            expect(contactElement.name.isDisplayed()).toBe(true);
            expect(contactElement.phoneNumber.isDisplayed()).toBe(true);
            expect(contactElement.email.isDisplayed()).toBe(true);
        }
        for ( i = 0 ; i < libraryPage.testLibrary.eResourceLiaisonContacts.length ; i++ ) {
            contactElement = libraryPage.getContactViewElement('E-Resources Liaison', i);
            expect(contactElement.name.isDisplayed()).toBe(true);
            expect(contactElement.phoneNumber.isDisplayed()).toBe(true);
            expect(contactElement.email.isDisplayed()).toBe(true);
        }
        for ( i = 0 ; i < libraryPage.testLibrary.otherContacts.length ; i++ ) {
            contactElement = libraryPage.getContactViewElement('Other', i);
            expect(contactElement.name.isDisplayed()).toBe(true);
            expect(contactElement.phoneNumber.isDisplayed()).toBe(true);
            expect(contactElement.email.isDisplayed()).toBe(true);
        }
        for ( i = 0 ; i < libraryPage.testLibrary.notificationOnlyContacts.length ; i++ ) {
            contactElement = libraryPage.getContactViewElement('Notification Only', i);
            expect(contactElement.name.isDisplayed()).toBe(true);
            expect(contactElement.phoneNumber.isDisplayed()).toBe(true);
            expect(contactElement.email.isDisplayed()).toBe(true);
        }
    });
});

describe('Viewing an existing Library in edit mode', function () {
    var libraryPage = new LibraryPage();


    it('should be in edit mode', function () {
        libraryPage.editButton.click();
    });

    it('should have a populated name field', function() {
        expect(libraryPage.nameInput.getAttribute('value')).toBe(libraryPage.testLibrary.name);
    });

    it('should have a populated Full-Time Enrollment field', function() {
        expect(libraryPage.fteInput.getAttribute('value')).toBe( toString(libraryPage.testLibrary.fte) );
    });

    it('should have a selected Institution Years value', function() {
        expect(libraryPage.institutionYearsInputSelectedOption.getText()).toBe(libraryPage.testLibrary.institutionYears);
    });

    it('should have a selected Institution Type value', function() {
        expect(libraryPage.institutionTypeInputSelectedOption.getText()).toBe(libraryPage.testLibrary.institutionType);
    });

    it('should have a populated IP Addresses field', function() {
        expect(libraryPage.ipAddressInput.getAttribute('value')).toBe(libraryPage.testLibrary.ipAddresses);
    });

    it('should have a selected Membership Level value', function() {
        expect(libraryPage.membershipLevelInputSelectedOption.getText()).toBe(libraryPage.testLibrary.membershipLevel);
    });

    it('should have a correctly selected I-Share Member checkbox', function() {
        expect(libraryPage.iShareInput.getAttribute('checked')).toBe(libraryPage.testLibrary.isIshareMember ? 'true' : null);
    });

    macro.ensureInputHasValue( libraryPage.garInput, 'GAR Input', libraryTestConfig.gar.value1 );

    it('should have a correctly selected Membership Status radio button', function() {
        expect(libraryPage.getStatusInputActive()).toBe(libraryPage.testLibrary.isActive ? 'true' : null);
    });

    it('should have correctly filled in User fields', function(){
        var contactForm, contact;

        for ( i = 0 ; i < libraryPage.testLibrary.directorContacts.length ; i++ ){
            contactForm = libraryPage.getContactEditForm('Director', i);
            contact = libraryPage.testLibrary.directorContacts[i];
            expect(contactForm.name.getAttribute('value')).toBe(contact.name);
            expect(contactForm.email.getAttribute('value')).toBe(contact.email);
            expect(contactForm.phoneNumber.getAttribute('value')).toBe(contact.phoneNumber);
        }

        for ( i = 0 ; i < libraryPage.testLibrary.eResourceLiaisonContacts.length ; i++ ){
            contactForm = libraryPage.getContactEditForm('E-Resources Liaison', i);
            contact = libraryPage.testLibrary.eResourceLiaisonContacts[i];
            expect(contactForm.name.getAttribute('value')).toBe(contact.name);
            expect(contactForm.email.getAttribute('value')).toBe(contact.email);
            expect(contactForm.phoneNumber.getAttribute('value')).toBe(contact.phoneNumber);
        }

        for ( i = 0 ; i < libraryPage.testLibrary.otherContacts.length ; i++ ){
            contactForm = libraryPage.getContactEditForm('Other', i);
            contact = libraryPage.testLibrary.otherContacts[i];
            expect(contactForm.name.getAttribute('value')).toBe(contact.name);
            expect(contactForm.email.getAttribute('value')).toBe(contact.email);
            expect(contactForm.phoneNumber.getAttribute('value')).toBe(contact.phoneNumber);
        }

        for ( i = 0 ; i < libraryPage.testLibrary.notificationOnlyContacts.length ; i++ ){
            contactForm = libraryPage.getContactEditForm('Notification Only', i);
            contact = libraryPage.testLibrary.notificationOnlyContacts[i];
            expect(contactForm.name.getAttribute('value')).toBe(contact.name);
            expect(contactForm.email.getAttribute('value')).toBe(contact.email);
            expect(contactForm.phoneNumber.getAttribute('value')).toBe(contact.phoneNumber);
        }
    });
});

describe('Making changes to an existing Library', function(){
    var libraryPage = new LibraryPage();

    it('should change the entry on the Library list screen when changing the name', function () {
        browser.setLocation('/library');

        libraryPage.listFilterShowAll.click();

        element.all(by.repeater('entity in values'))
            .filter(function (el, index) {
                return el.getText().then(function (text) {
                    return (text.search(libraryPage.testLibrary.name) > -1);
                });
            })
            .then(function (libraryList) {
                libraryList[0].element(by.tagName('a')).click();
            });

        libraryPage.editButton.click();

        libraryPage.fillInLibrary( libraryPage.testEditLibrary );

        libraryPage.submit.click();

        libraryPage.listFilterShowAll.click();

        element.all(by.repeater('entity in values'))
            .filter(function (el, index) {
                return el.getText().then(function (text) {
                    return (text.search(libraryPage.testEditLibrary.name) > -1);
                });
            })
            .then(function (libraryList) {
                expect( libraryList.length ).toBe(1);
                libraryList[0].element(by.tagName('a')).click();
            });
    });

    it('should display updated name', function() {
        libraryPage.nameDisplay.getText().then(function (text) {
            expect(text).toBe(libraryPage.testEditLibrary.name);
        });
    });

    it('should display updated Full Time Enrollment', function() {
        libraryPage.fteDisplay.getText().then(function (text) {
            expect(text).toBe( toString(libraryPage.testEditLibrary.fte));
        });
    });

    it('should display updated Institution Years', function() {
        libraryPage.institutionYersInputDisplay.getText().then(function (text) {
            expect(text).toBe(libraryPage.testEditLibrary.institutionYears);
        });
    });

    it('should display updated Institution Type', function() {
        libraryPage.institutionTypeInputDisplay.getText().then(function (text) {
            expect(text).toBe(libraryPage.testEditLibrary.institutionType);
        });
    });

    it('should display updated ipAddresses', function() {
        libraryPage.ipAddressnputDisplay.getText().then(function (text) {
            expect(text).toBe(libraryPage.testEditLibrary.ipAddresses);
        });
    });

    it('should display updated Membership Level', function() {
        libraryPage.membershipLevelInputDisplay.getText().then(function (text) {
            expect(text).toBe(libraryPage.testEditLibrary.membershipLevel);
        });
    });

    it('should display updated iShare', function() {
        libraryPage.iShareInputDisplay.getText().then(function (text) {
            expect(text).toBe( toString(libraryPage.testEditLibrary.isIshareMember) );
        });
    });

    it('should display updated GAR', function() {
        libraryPage.garInputDisplay.getText().then(function (text) {
            expect(text).toBe(libraryPage.testEditLibrary.gar);
        });
    });

    it('should display updated Library Status', function() {
        libraryPage.statusInputDisplay.getText().then(function (text) {
            expect(text).toBe(libraryPage.testEditLibrary.isActive ? 'Active' : 'Inactive');
        });
    });

    it('should display updated Contacts', function() {
        var contactElement;
        for ( i = 0 ; i < libraryPage.testEditLibrary.directorContacts.length ; i++ ) {
            contactElement = libraryPage.getContactViewElement('Director', i);
            expect(contactElement.name.isDisplayed()).toBe(true);
            expect(contactElement.phoneNumber.isDisplayed()).toBe(true);
            expect(contactElement.email.isDisplayed()).toBe(true);
        }
        for ( i = 0 ; i < libraryPage.testEditLibrary.eResourceLiaisonContacts.length ; i++ ) {
            contactElement = libraryPage.getContactViewElement('E-Resources Liaison', i);
            expect(contactElement.name.isDisplayed()).toBe(true);
            expect(contactElement.phoneNumber.isDisplayed()).toBe(true);
            expect(contactElement.email.isDisplayed()).toBe(true);
        }
        for ( i = 0 ; i < libraryPage.testEditLibrary.otherContacts.length ; i++ ) {
            contactElement = libraryPage.getContactViewElement('Other', i);
            expect(contactElement.name.isDisplayed()).toBe(true);
            expect(contactElement.phoneNumber.isDisplayed()).toBe(true);
            expect(contactElement.email.isDisplayed()).toBe(true);
        }
        for ( i = 0 ; i < libraryPage.testEditLibrary.notificationOnlyContacts.length ; i++ ) {
            contactElement = libraryPage.getContactViewElement('Notification Only', i);
            expect(contactElement.name.isDisplayed()).toBe(true);
            expect(contactElement.phoneNumber.isDisplayed()).toBe(true);
            expect(contactElement.email.isDisplayed()).toBe(true);
        }
    });
});
