function toString( val ){
    return val + '';
}

var LibraryPage = require('./LibraryPage.spec');

describe('The New Library screen', function () {
    var libraryPage = new LibraryPage();

    it('should be routed at /library/new', function(){
        browser.setLocation('/library/new');
    });

    it('should have a default name input field', function () {
        expect(libraryPage.nameInput.isPresent()).toBe(true);
        expect(libraryPage.nameInput.getAttribute('value')).toBe('');
    });

    it('should have a blank Full Time Enrollment input field', function () {
        expect(libraryPage.fteInput.isPresent()).toBe(true);
        expect(libraryPage.fteInput.getAttribute('value')).toBe('');
    });

    it('should have a blank Institution Years select', function () {
        expect(libraryPage.institutionYearsInput.isPresent()).toBe(true);
        //expect ? because that's what Angular puts be default for the empty option (when nothing is set in the model by default)
        expect(libraryPage.institutionYearsInput.getAttribute('value')).toBe('?');
    });

    it('should have a blank Institution Type Select', function () {
        expect(libraryPage.institutionTypeInput.isPresent()).toBe(true);
        expect(libraryPage.institutionTypeInput.getAttribute('value')).toBe('?');
    });

    it('should have a blank ipAddress Input', function () {
        expect(libraryPage.ipAddressInput.isPresent()).toBe(true);
        expect(libraryPage.ipAddressInput.getAttribute('value')).toBe('');
    });

    it('should have a blank Membership Level Select', function () {
        expect(libraryPage.membershipLevelInput.isPresent()).toBe(true);
        expect(libraryPage.membershipLevelInput.getAttribute('value')).toBe('?');
    });

    it('should have a blank iShareInput', function () {
        expect(libraryPage.iShareInput.isPresent()).toBe(true);
        // expect null because Protractor returns 'true' if checked and null if not
        expect(libraryPage.iShareInput.getAttribute('checked')).toBe(null);
    });

    it('should have a blank GAR Input', function () {
        expect(libraryPage.garInput.isPresent()).toBe(true);
        expect(libraryPage.garInput.getAttribute('value')).toBe('');
    });

    it('should have a active / inactive control', function () {
        libraryPage.statusInputs.then(function(items) {
            expect(items.length).toBe(2);
            expect(items[0].getAttribute('type')).toBe('radio');
            expect(items[1].getAttribute('type')).toBe('radio');
        });
    });

    it('should have "Add Contact" links for all four types of users', function () {
        expect(libraryPage.addDirectorContactLink.isPresent()).toBe(true);
        expect(libraryPage.addEresourceLiaisonContactLink.isPresent()).toBe(true);
        expect(libraryPage.addOtherContactLink.isPresent()).toBe(true);
        expect(libraryPage.addNotificationOnlyContactLink.isPresent()).toBe(true);
    });


    it('should save a new Library when filling in the form and clicking save', function() {
        var i, contact, testData, libraryList;

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

    it('should not have an editable name input field', function () {
        expect(libraryPage.nameInput.isDisplayed()).toBe(false);
    });

    it('should not have an editable Full Time Enrollment input field', function () {
        expect(libraryPage.fteInput.isDisplayed()).toBe(false);
    });

    it('should not have an editable Institution Years textarea Select', function () {
        expect(libraryPage.institutionYearsInput.isDisplayed()).toBe(false);
    });

    it('should not have an editable Institution Type Select', function () {
        expect(libraryPage.institutionTypeInput.isDisplayed()).toBe(false);
    });

    it('should not have an editable ipAddress Input', function () {
        expect(libraryPage.ipAddressInput.isDisplayed()).toBe(false);
    });

    it('should not have an editable Membership Level Select', function () {
        expect(libraryPage.membershipLevelInput.isDisplayed()).toBe(false);
    });

    it('should not have an editable iShareInput', function () {
        expect(libraryPage.iShareInput.isDisplayed()).toBe(false);
    });

    it('should not have an editable GAR Input', function () {
        expect(libraryPage.garInput.isDisplayed()).toBe(false);
    });

    it('should not display editable User fields', function() {
        var contactForm;
        for ( i = 0 ; i < libraryPage.testLibrary.directorContacts.length ; i++ ) {
            contactForm = libraryPage.getContactEditForm('Director', i);
            expect(contactForm.name.isDisplayed()).toBe(false);
            expect(contactForm.phoneNumber.isDisplayed()).toBe(false);
            expect(contactForm.email.isDisplayed()).toBe(false);
        }
        for ( i = 0 ; i < libraryPage.testLibrary.eResourceLiaisonContacts.length ; i++ ) {
            contactForm = libraryPage.getContactEditForm('E-Resources Liaison', i);
            expect(contactForm.name.isDisplayed()).toBe(false);
            expect(contactForm.phoneNumber.isDisplayed()).toBe(false);
            expect(contactForm.email.isDisplayed()).toBe(false);
        }
        for ( i = 0 ; i < libraryPage.testLibrary.otherContacts.length ; i++ ) {
            contactForm = libraryPage.getContactEditForm('Other', i);
            expect(contactForm.name.isDisplayed()).toBe(false);
            expect(contactForm.phoneNumber.isDisplayed()).toBe(false);
            expect(contactForm.email.isDisplayed()).toBe(false);
        }
        for ( i = 0 ; i < libraryPage.testLibrary.notificationOnlyContacts.length ; i++ ) {
            contactForm = libraryPage.getContactEditForm('Notification Only', i);
            expect(contactForm.name.isDisplayed()).toBe(false);
            expect(contactForm.phoneNumber.isDisplayed()).toBe(false);
            expect(contactForm.email.isDisplayed()).toBe(false);
        }
    });

    it('should display name', function() {
        libraryPage.nameDisplay.getText().then(function (text) {
            expect(text).toBe(libraryPage.testLibrary.name);
        });
    });

    it('should display Full Time Enrollment', function() {
        libraryPage.fteDisplay.getText().then(function (text) {
            expect(text).toBe( toString(libraryPage.testLibrary.fte));
        });
    });

    it('should display Institution Years', function() {
        libraryPage.institutionYersInputDisplay.getText().then(function (text) {
            expect(text).toBe(libraryPage.testLibrary.institutionYears);
        });
    });

    it('should display Institution Type', function() {
        libraryPage.institutionTypeInputDisplay.getText().then(function (text) {
            expect(text).toBe(libraryPage.testLibrary.institutionType);
        });
    });

    it('should display ipAddresses', function() {
        libraryPage.ipAddressnputDisplay.getText().then(function (text) {
            expect(text).toBe(libraryPage.testLibrary.ipAddresses);
        });
    });

    it('should display Membership Level', function() {
        libraryPage.membershipLevelInputDisplay.getText().then(function (text) {
            expect(text).toBe(libraryPage.testLibrary.membershipLevel);
        });
    });

    it('should display iShare', function() {
        libraryPage.iShareInputDisplay.getText().then(function (text) {
            expect(text).toBe( toString(libraryPage.testLibrary.isIshareMember) );
        });
    });

    it('should display GAR', function() {
        libraryPage.garInputDisplay.getText().then(function (text) {
            expect(text).toBe(libraryPage.testLibrary.gar);
        });
    });

    it('should display Library Status', function() {
        libraryPage.statusInputDisplay.getText().then(function (text) {
            expect(text).toBe(libraryPage.testLibrary.isActive ? 'Active' : 'Inactive');
        });
    });

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
        expect(libraryPage.institutionYearsInput.getAttribute('value')).toBe(libraryPage.testLibrary.institutionYears);
    });

    it('should have a selected Institution Type value', function() {
        expect(libraryPage.institutionTypeInput.getAttribute('value')).toBe(libraryPage.testLibrary.institutionType);
    });

    it('should have a populated IP Addresses field', function() {
        expect(libraryPage.ipAddressInput.getAttribute('value')).toBe(libraryPage.testLibrary.ipAddresses);
    });

    it('should have a selected Membership Level value', function() {
        expect(libraryPage.membershipLevelInput.getAttribute('value')).toBe(libraryPage.testLibrary.membershipLevel);
    });

    it('should have a correctly selected I-Share Member checkbox', function() {
        expect(libraryPage.iShareInput.getAttribute('checked')).toBe(libraryPage.testLibrary.isIshareMember ? 'true' : null);
    });

    it('should have a populated GAR field', function() {
        expect(libraryPage.garInput.getAttribute('value')).toBe(libraryPage.testLibrary.gar);
    });

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

    it('should save changes to the name field', function() {
        expect(libraryPage.nameInput.getAttribute('value')).toBe(libraryPage.testEditLibrary.name);
    });

    it('should save changes to the Full-Time Enrollment field', function() {
        expect(libraryPage.fteInput.getAttribute('value')).toBe(libraryPage.testEditLibrary.fte);
    });

    it('should save changes to the Institution Years select list', function() {
        expect(libraryPage.institutionYearsInput.getAttribute('value')).toBe(libraryPage.testEditLibrary.institutionYears);
    });

    it('should save changes to the Institution Type select list', function() {
        expect(libraryPage.institutionTypeInput.getAttribute('value')).toBe(libraryPage.testEditLibrary.institutionType);
    });

    it('should save changes to the IP Addresses field', function() {
        expect(libraryPage.ipAddressInput.getAttribute('value')).toBe(libraryPage.testEditLibrary.ipAddresses);
    });

    it('should save changes to the Membership select list', function() {
        expect(libraryPage.membershipLevelInput.getAttribute('value')).toBe(libraryPage.testEditLibrary.membershipLevel);
    });

    it('should save changes to the I-Share Member checkbox', function() {
        expect(libraryPage.iShareInput.getAttribute('value')).toBe(libraryPage.testEditLibrary.isIshareMember ? 'true' : null);
    });

    it('should save changes to the GAR field', function() {
        expect(libraryPage.garInput.getAttribute('value')).toBe(libraryPage.testEditLibrary.gar);
    });

    it('should save changes to the Membership Status radio button', function() {
        expect(libraryPage.getStatusInputActive()).toBe(libraryPage.testEditLibrary.isActive ? 'true' : null);
    });

    it('should save changes to the User fields', function(){
        var contactForm, contact;

        for ( i = 0 ; i < libraryPage.testEditLibrary.directorContacts.length ; i++ ){
            contactForm = libraryPage.getContactEditForm('Director', i);
            contact = libraryPage.testEditLibrary.directorContacts[i];
            expect(contactForm.name.getAttribute('value')).toBe(contact.name);
            expect(contactForm.email.getAttribute('value')).toBe(contact.email);
            expect(contactForm.phoneNumber.getAttribute('value')).toBe(contact.phoneNumber);
        }

        for ( i = 0 ; i < libraryPage.testEditLibrary.eResourceLiaisonContacts.length ; i++ ){
            contactForm = libraryPage.getContactEditForm('E-Resources Liaison', i);
            contact = libraryPage.testEditLibrary.eResourceLiaisonContacts[i];
            expect(contactForm.name.getAttribute('value')).toBe(contact.name);
            expect(contactForm.email.getAttribute('value')).toBe(contact.email);
            expect(contactForm.phoneNumber.getAttribute('value')).toBe(contact.phoneNumber);
        }

        for ( i = 0 ; i < libraryPage.testEditLibrary.otherContacts.length ; i++ ){
            contactForm = libraryPage.getContactEditForm('Other', i);
            contact = libraryPage.testEditLibrary.otherContacts[i];
            expect(contactForm.name.getAttribute('value')).toBe(contact.name);
            expect(contactForm.email.getAttribute('value')).toBe(contact.email);
            expect(contactForm.phoneNumber.getAttribute('value')).toBe(contact.phoneNumber);
        }

        for ( i = 0 ; i < libraryPage.testEditLibrary.notificationOnlyContacts.length ; i++ ){
            contactForm = libraryPage.getContactEditForm('Notification Only', i);
            contact = libraryPage.testEditLibrary.notificationOnlyContacts[i];
            expect(contactForm.name.getAttribute('value')).toBe(contact.name);
            expect(contactForm.email.getAttribute('value')).toBe(contact.email);
            expect(contactForm.phoneNumber.getAttribute('value')).toBe(contact.phoneNumber);
        }
    });
});
