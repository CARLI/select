var macro = require('./protractorMacros');
elementById = macro.elementById;
ensureFormElementIsPresentAndBlank = macro.ensureFormElementIsPresentAndBlank;
setFormElementValue = macro.setFormElementValue;

var contactEditorMacro = require('./protractorContactEditorMacros');
ensureContactEditorIsPresentAndBlank = contactEditorMacro.ensureContactEditorIsPresentAndBlank;
ensureContactEditorIsHidden = contactEditorMacro.ensureContactEditorIsHidden;

toString = macro.toString;

/**
 * The configuration below is used by the macros to generate tests. They take the following form:
 * propertyName should match the schema
 *
 * propertyName: {
 *       type: the input type (tag name) or 'contact' for a list of contacts
 *       description: how the form field will appear in test descriptions
 *       model: the value of the ng-model attribute used to bind the input to the Controller
 *       value1: the value used when creating the test entity
 *       value2: the value used when testing editing the entity
 *       valueToIndex: for radio buttons, tells which value (label) maps to which button (by index)
 * }
 */
var formInputsTestConfig = {
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
            'Active': 0,
            'Inactive': 1
        }
    }
};

testLibraryName = formInputsTestConfig.name.value1;
testLibraryEditedName = formInputsTestConfig.name.value2;

/**
 * This configuration is used to test the contact editors
 *
 *  description: how the contact editor group will appear in test descriptions
 *  model: the value from the Controller that appears in the ng-repeat
 *  value1: the value used when creating the test entity
 *  value2: the value used when testing editing the entity
 *  filterString: which 'filter' value is used to get the list of contacts by repeater
 */
var contactEditorsTestConfig = {
    directorContacts: {
        description: 'Director Contacts',
        model: 'vm.library.contacts',
        filterString: 'Director',
        addContactLink: elementById('add-director-contact'),
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
        description: 'E-Resource Liaison Contacts',
        model: 'vm.library.contacts',
        filterString: 'E-Resources Liaison',
        addContactLink: elementById('add-e-resources-liaison-contact'),
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
        description: 'Other Contacts',
        model: 'vm.library.contacts',
        filterString: 'Other',
        addContactLink: elementById('add-other-contact'),
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
        description: 'Notification Only Contacts',
        model: 'vm.library.contacts',
        filterString: 'Notification Only',
        addContactLink: elementById('add-notification-only-contact'),
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

/**
 * Other special-case elements specific to this page, plus some helper functions
 */
var libraryPage = {
    listFilterShowAll: element(by.cssContainingText('.ng-binding', 'All libraries')),
    submit: element(by.id('library-submit')),
    editButton: element(by.id('library-edit')),

    addEmptyContactsForTestData: function(){
        var i, config;

        for ( var contactEditor in contactEditorsTestConfig ){
            config = contactEditorsTestConfig[contactEditor];

            for ( i = 0 ; i < config.value1.length -1 ; i++ ){
                config.addContactLink.click();
            }
        }
    },

    fillInLibraryWithTestData: function( useEditData ){
        var row, formElement, contactEditor;
        var dataSet = useEditData || 'value1';

        for ( formElement in formInputsTestConfig ){
            config = formInputsTestConfig[formElement];

            setFormElementValue( config, config[dataSet] );
        }

        for ( contactEditor  in contactEditorsTestConfig ){
            config = contactEditorsTestConfig[contactEditor];

            for ( row = 0 ; row < config[dataSet].length ; row++ ){
                contactEditorMacro.fillInContactRow( config, row, config[dataSet][row] );
            }
        }
    }
};

describe('The New Library screen', function () {
    var config;

    it('should be routed at /library/new', function(){
        browser.setLocation('/library/new');
    });

    for ( var formElement in formInputsTestConfig ){
        ensureFormElementIsPresentAndBlank( formInputsTestConfig[formElement] );
    }

    for ( var contactEditor in contactEditorsTestConfig ){
        config = contactEditorsTestConfig[contactEditor];
        macro.ensureElementIsPresent( config.addContactLink, 'Add Contact Link for ' + config.description );
        ensureContactEditorIsPresentAndBlank( config );
    }
});

describe('Creating a New Library', function(){
    it('should save a new Library when filling in the form and clicking save', function() {

        libraryPage.addEmptyContactsForTestData();
        libraryPage.fillInLibraryWithTestData();

        libraryPage.submit.click();

        libraryPage.listFilterShowAll.click();

        element.all(by.repeater('entity in values'))
        .filter( function(el, index) {
            return el.getText().then(function(text){
                return (text.search(testLibraryName) > -1);
            });
        })
        .then( function( libraryList ) {
            expect( libraryList.length ).toBe(1);
        });
    });
});

describe('Viewing an existing Library in read only mode', function () {

    var config, formElement, contactEditor;

    it('should be routed to the screen for the test library', function () {

        //Don't need to call these as long as the previous test left us on the list page with 'All' showing
        //browser.setLocation('/library');
        //libraryPage.listFilterShowAll.click();

        element.all(by.repeater('entity in values'))
            .filter(function (el, index) {
                return el.getText().then(function (text) {
                    return (text.search(testLibraryName) > -1);
                });
            })
            .then(function (libraryList) {
                libraryList[0].element(by.tagName('a')).click();
            });
    });

    for ( formElement in formInputsTestConfig ){
        macro.ensureFormElementIsHidden( formInputsTestConfig[formElement] );
    }

    for ( contactEditor in contactEditorsTestConfig ){
        ensureContactEditorIsHidden( contactEditorsTestConfig[contactEditor] );
    }

    for ( formElement in formInputsTestConfig ){
        config = formInputsTestConfig[formElement];
        macro.ensureFormElementDisplaysText( config, config.value1 );
    }

    for ( contactEditor in contactEditorsTestConfig ){
        //TODO: ensureContactEditorDisplays( 'value1' )
    }
});

describe('Viewing an existing Library in edit mode', function () {
    var config, formElement, contactEditor;

    it('should be in edit mode', function () {
        libraryPage.editButton.click();
    });

    for ( formElement in formInputsTestConfig ){
        config = formInputsTestConfig[formElement];
        macro.ensureFormElementHasValue( config, config.value1 );
    }

    for ( contactEditor in contactEditorsTestConfig ){
        //TODO: ensureContactEditorHasValues( 'value1' )
    }
});

describe('Making changes to an existing Library', function(){
    var config, formElement, contactEditor;

    it('should change the entry on the Library list screen when changing the name', function () {
        browser.setLocation('/library');

        libraryPage.listFilterShowAll.click();

        element.all(by.repeater('entity in values'))
            .filter(function (el, index) {
                return el.getText().then(function (text) {
                    return (text.search(testLibraryName) > -1);
                });
            })
            .then(function (libraryList) {
                libraryList[0].element(by.tagName('a')).click();
            });

        libraryPage.editButton.click();

        libraryPage.fillInLibraryWithTestData('value2');

        libraryPage.submit.click();

        libraryPage.listFilterShowAll.click();

        element.all(by.repeater('entity in values'))
            .filter(function (el, index) {
                return el.getText().then(function (text) {
                    return (text.search(testLibraryEditedName) > -1);
                });
            })
            .then(function (libraryList) {
                expect( libraryList.length ).toBe(1);
                libraryList[0].element(by.tagName('a')).click();
            });

    });

    for ( formElement in formInputsTestConfig ){
        config = formInputsTestConfig[formElement];
        macro.ensureFormElementDisplaysText( config, config.value2 );
    }

    for ( contactEditor in contactEditorsTestConfig ){
        //TODO: ensureContactEditorDisplays( 'value2' )
    }
});
