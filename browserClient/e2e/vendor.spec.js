var config = require('./utils/baseConfig');
config.getDefaultAppPage();

var macro = require('./utils/protractorMacros');
elementById = macro.elementById;
ensureFormElementIsPresentAndBlank = macro.ensureFormElementIsPresentAndBlank;
setFormElementValue = macro.setFormElementValue;

var contactEditorMacro = require('./utils/protractorContactEditorMacros');
ensureContactEditorIsPresentAndBlank = contactEditorMacro.ensureContactEditorIsPresentAndBlank;
ensureContactEditorIsHidden = contactEditorMacro.ensureContactEditorIsHidden;
ensureContactRowHasValues = contactEditorMacro.ensureContactRowHasValues;
ensureContactRowDisplaysValues = contactEditorMacro.ensureContactRowDisplaysValues;

var formInputsTestConfig = {
    name: {
        type: 'input',
        description: 'Name',
        model: 'vm.vendor.name',
        initialValue: 'Test Vendor 1',
        editedValue: 'Change Vendor Name'
    },
    websiteUrl: {
        type: 'input',
        description: 'Website URL',
        model: 'vm.vendor.websiteUrl',
        initialValue: 'http://www.example.com',
        editedValue: 'http://www.example.net'
    },
    adminModule: {
        type: 'textarea',
        description: 'Admin Module',
        model: 'vm.vendor.adminModule',
        initialValue: 'This is an admin module comment',
        editedValue: 'This is an edited admin module comment'
    },
    comments: {
        type: 'textarea',
        description: 'Comments',
        model: 'vm.vendor.comments',
        initialValue: 'This is a comment',
        editedValue: 'This is an edited comment'
    },
    isActive: {
        type: 'radio',
        description: 'isActive',
        model: 'vm.vendor.isActive',
        initialValue: 'Inactive',
        editedValue: 'Active',
        valueToIndex: {
            'Active': 0,
            'Inactive': 1
        }
    }
};

testVendorName = formInputsTestConfig.name.initialValue;
testVendorEditedName = formInputsTestConfig.name.editedValue;

var contactEditorsTestConfig = {
    billingContacts: {
        description: 'Billing Contacts',
        model: 'vm.vendor.contacts',
        filterString: 'Billing',
        addContactLink: elementById('add-billing-contact'),
        initialValue: [
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
        editedValue: [
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
        ]
    },
    salesContacts: {
        description: 'Sales Contacts',
        model: 'vm.vendor.contacts',
        filterString: 'Sales',
        addContactLink: elementById('add-sales-contact'),
        initialValue: [
            {
                name: 'Sales Contact 1',
                email:'sales@exmaple.com',
                phoneNumber:'234-5678'
            }
        ],
        editedValue: [
            {
                name: 'Sales Contact 1 - Edited',
                email:'sales.edit@exmaple.com',
                phoneNumber:'217-5678'
            }
        ]
    },
    technicalContacts: {
        description: 'Technical Contacts',
        model: 'vm.vendor.contacts',
        filterString: 'Technical',
        addContactLink: elementById('add-technical-contact'),
        initialValue: [
            {
                name: 'Technical Contact 1',
                email:'tech@example.com',
                phoneNumber:'345-6789'
            }
        ],
        editedValue: [
            {
                name: 'Technical Contact 1 - Edited',
                email:'tech.edit@example.com',
                phoneNumber:'217-6789'
            }
        ]
    }
};

var pageConfig = {
    listFilterShowAll: element(by.id('filter-all')),
    submit: element(by.id('vendor-submit')),
    editButton: element(by.id('vendor-edit')),
    newButton: element(by.id('new-vendor')),
    newVendorModal: element(by.id('new-vendor-modal')),

    addEmptyContactsForTestData: function(){
        var i, config;

        for ( var contactEditor in contactEditorsTestConfig ){
            config = contactEditorsTestConfig[contactEditor];

            for ( i = 0 ; i < config.initialValue.length -1 ; i++ ){
                config.addContactLink.click();
            }
        }
    },

    fillInVendorWithTestData: function( useEditData ){
        var row, formElement, contactEditor;
        var dataSet = useEditData || 'initialValue';

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



describe('The New Vendor Modal', function () {
    var formElement, contactEditor;

    it('should be routed at /vendor', function(){
        browser.setLocation('/vendor');
    });
    macro.ensureElementIsPresent( pageConfig.newButton, 'New Vendor button' );

    it('should be displayed by clicking the New Vendor button', function () {
        pageConfig.newButton.click();
        browser.sleep(500);
        expect(pageConfig.newVendorModal.isDisplayed()).toBe(true);
    });
    for ( formElement in formInputsTestConfig ){
        ensureFormElementIsPresentAndBlank( formInputsTestConfig[formElement] );
    }

    for ( contactEditor in contactEditorsTestConfig ){
        config = contactEditorsTestConfig[contactEditor];
        macro.ensureElementIsPresent( config.addContactLink, 'Add Contact Link for ' + config.description );
        ensureContactEditorIsPresentAndBlank( config );
    }
});

describe('Creating a New Vendor', function(){
    it('should save a new Vendor when filling in the form and clicking save', function() {
        pageConfig.addEmptyContactsForTestData();
        pageConfig.fillInVendorWithTestData();

        pageConfig.submit.click();
    });

    it('should go back to the list screen after submitting', function() {
        expect( browser.getLocationAbsUrl() ).toBe('/vendor');
    });

    it('should find the new Vendor in the list screen', function(){
        pageConfig.listFilterShowAll.click();

        element.all(by.repeater('entity in values'))
        .filter( function(el, index) {
            return el.getText().then(function(text){
                return (text.search(testVendorName) > -1);
            });
        })
        .then( function( vendorList ) {
            expect( vendorList.length ).toBe(1);
        });
    });

});


describe('Viewing an existing Vendor in read only mode', function () {
    var row, config, formElement, contactEditor;

    it('should find the Vendor entry on the Vendor list screen', function () {

        //Don't need to call these as long as the previous test left us on the list page with 'All' showing
        //browser.setLocation('/vendor');
        //pageConfig.listFilterShowAll.click();

        element.all(by.repeater('entity in values'))
            .filter(function (el, index) {
                return el.getText().then(function (text) {
                    return (text.search(testVendorName) > -1);
                });
            })
            .then(function (vendorList) {
                vendorList[0].element(by.tagName('a')).click();
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
        macro.ensureFormElementDisplaysText( config, config.initialValue );
    }

    for ( contactEditor in contactEditorsTestConfig ){
        config = contactEditorsTestConfig[contactEditor];

        for ( row = 0 ; row < config.initialValue.length ; row++ ){
            ensureContactRowDisplaysValues( config, row, config.initialValue[row] );
        }
    }
});

describe('Viewing an existing Vendor in edit mode', function () {
    var row, config, formElement, contactEditor;

    it('should be in edit mode', function () {
        pageConfig.editButton.click();
    });

    for ( formElement in formInputsTestConfig ){
        config = formInputsTestConfig[formElement];
        macro.ensureFormElementHasValue( config, config.initialValue );
    }

    for (contactEditor in contactEditorsTestConfig) {
        config = contactEditorsTestConfig[contactEditor];

        for (row = 0; row < config.initialValue.length; row++) {
            ensureContactRowHasValues(config, row, config.initialValue[row] );
        }
    }
});

describe('Making changes to an existing Vendor', function(){
    var config, formElement, contactEditor;

    it('should find the Vendor entry on the Vendor list screen', function () {
        browser.setLocation('/vendor');

        pageConfig.listFilterShowAll.click();

        element.all(by.repeater('entity in values'))
            .filter(function (el, index) {
                return el.getText().then(function (text) {
                    return (text.search(testVendorName) > -1);
                });
            })
            .then(function (vendorList) {
                vendorList[0].element(by.tagName('a')).click();
            });
    });

    it('should save changes to the Vendor entity and go back to the list screen', function () {
        pageConfig.editButton.click();

        pageConfig.fillInVendorWithTestData('editedValue');

        pageConfig.submit.click();

        expect( browser.getLocationAbsUrl() ).toBe('/vendor');

        pageConfig.listFilterShowAll.click();
    });

    it('should change the entry on the Vendor list screen when changing the name', function () {
        element.all(by.repeater('entity in values'))
            .filter(function (el, index) {
                return el.getText().then(function (text) {
                    return (text.search(testVendorEditedName) > -1);
                });
            })
            .then(function (vendorList) {
                expect( vendorList.length ).toBe(1);
                vendorList[0].element(by.tagName('a')).click();
            });
    });

    for ( formElement in formInputsTestConfig ){
        config = formInputsTestConfig[formElement];
        macro.ensureFormElementDisplaysText( config, config.editedValue );
    }

    for (contactEditor in contactEditorsTestConfig) {
        config = contactEditorsTestConfig[contactEditor];

        for (row = 0; row < config.editedValue.length; row++) {
            ensureContactRowHasValues(config, row, config.editedValue[row] );
        }
    }
});
