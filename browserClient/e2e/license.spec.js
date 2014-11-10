var macro = require('./protractorMacros');
elementById = macro.elementById;
ensureFormElementIsPresentAndBlank = macro.ensureFormElementIsPresentAndBlank;
setFormElementValue = macro.setFormElementValue;

var formInputsTestConfig = {
    name: {
        type: 'input',
        description: 'Name',
        model: 'vm.license.name',
        initialValue: 'Test License 1',
        editedValue: 'Change License Name'
    },
    contractNumber: {
        type: 'input',
        description: 'Contract Number',
        model: 'vm.license.contractNumber',
        initialValue: 'Contract #1',
        editedValue: 'Contract #1.1'
    },
    redactedLicenseFile: {
        type: 'input',
        description: 'Redacted License',
        model: 'vm.license.redactedLicenseFile',
        initialValue: 'This will be a redacted file upload',
        editedValue: 'This will be a different redacted file upload'
    },
    fullLicenseFile: {
        type: 'input',
        description: 'Full License',
        model: 'vm.license.fullLicenseFile',
        initialValue: 'This will be a full license file upload',
        editedValue: 'This will be a different full license file upload'
    },
    eResourceComments: {
        type: 'textarea',
        description: 'Internal E-Resource Comments',
        model: 'vm.license.eResourceComments',
        initialValue: 'This is an Internal E-Resource Comment',
        editedValue: 'This is an edited Internal E-Resource Comment'
    },
    businessComments: {
        type: 'textarea',
        description: 'Internal Business Services',
        model: 'vm.license.businessComments',
        initialValue: 'This is an Internal Business Services',
        editedValue: 'This is an edited Internal Business Services'
    },
    isActive: {
        type: 'radio',
        description: 'isActive',
        model: 'vm.license.isActive',
        initialValue: 'Inactive',
        editedValue: 'Active',
        valueToIndex: {
            'Active': 0,
            'Inactive': 1
        }
    },
    effectiveDate: {
        type: 'input',
        description: 'Effective Date',
        model: 'vm.license.effectiveDate',
        initialValue: 'Effective Date -- will eventually be a viewEditDate',
        editedValue: 'Edited Effective Date'
    },
    totalTermStartDate: {
        type: 'input',
        description: 'Total Contract Term Start',
        model: 'vm.license.totalTermStartDate',
        initialValue: 'Term Start Date -- will eventually be a viewEditDate',
        editedValue: 'Edited Term Start Date'
    },
    totalTermEndDate: {
        type: 'input',
        description: 'Total Contract Term End',
        model: 'vm.license.totalTermEndDate',
        initialValue: 'Term End Date -- will eventually be a viewEditDate',
        editedValue: 'Edited Term End Date'
    },
    currentTermStartDate: {
        type: 'input',
        description: 'Total Current Term Start',
        model: 'vm.license.currentTermStartDate',
        initialValue: 'Current Start Date -- will eventually be a viewEditDate',
        editedValue: 'Edited Current Start Date'
    },
    currentTermEndDate: {
        type: 'input',
        description: 'Total Current Term End',
        model: 'vm.license.currentTermEndDate',
        initialValue: 'Current End Date -- will eventually be a viewEditDate',
        editedValue: 'Edited Current End Date'
    },
    remainingRenewals: {
        type: 'input',
        description: 'Remaining Renewals',
        model: 'vm.license.remainingRenewals',
        initialValue: '12',
        editedValue: '32'
    }
};

testLicenseName = formInputsTestConfig.name.initialValue;
testLicenseEditedName = formInputsTestConfig.name.editedValue;

var pageConfig = {
    listFilterShowAll: element(by.cssContainingText('.ng-binding', 'All licenses')),
    submit: element(by.id('license-submit')),
    editButton: element(by.id('license-edit')),


    fillInLicenseWithTestData: function( useEditData ){
        var row, formElement;
        var dataSet = useEditData || 'initialValue';

        for ( formElement in formInputsTestConfig ){
            config = formInputsTestConfig[formElement];

            setFormElementValue( config, config[dataSet] );
        }
    }
};



describe('The New License screen', function () {
    var formElement;

    it('should be routed at /license/new', function(){
        browser.setLocation('/license/new');
    });

    for ( formElement in formInputsTestConfig ){
        ensureFormElementIsPresentAndBlank( formInputsTestConfig[formElement] );
    }
});

describe('Creating a New License', function(){
    it('should save a new License when filling in the form and clicking save', function() {
        var licenseList;

        pageConfig.fillInLicenseWithTestData();

        pageConfig.submit.click();

        pageConfig.listFilterShowAll.click();

        element.all(by.repeater('entity in values'))
        .filter( function(el, index) {
            return el.getText().then(function(text){
                return (text.search(testLicenseName) > -1);
            });
        })
        .then( function( licenseList ) {
            expect( licenseList.length ).toBe(1);
        });
    });

});


describe('Viewing an existing License in read only mode', function () {
    var row, config, formElement;

    it('should be routed to the screen for the test license', function () {

        //Don't need to call these as long as the previous test left us on the list page with 'All' showing
        //browser.setLocation('/license');
        //pageConfig.listFilterShowAll.click();

        element.all(by.repeater('entity in values'))
            .filter(function (el, index) {
                return el.getText().then(function (text) {
                    return (text.search(testLicenseName) > -1);
                });
            })
            .then(function (licenseList) {
                licenseList[0].element(by.tagName('a')).click();
            });
    });

    for ( formElement in formInputsTestConfig ){
        macro.ensureFormElementIsHidden( formInputsTestConfig[formElement] );
    }

    for ( formElement in formInputsTestConfig ){
        config = formInputsTestConfig[formElement];
        macro.ensureFormElementDisplaysText( config, config.initialValue );
    }

});

describe('Viewing an existing License in edit mode', function () {
    var row, config, formElement;

    it('should be in edit mode', function () {
        pageConfig.editButton.click();
    });

    for ( formElement in formInputsTestConfig ){
        config = formInputsTestConfig[formElement];
        macro.ensureFormElementHasValue( config, config.initialValue );
    }

});

describe('Making changes to an existing License', function(){
    var config, formElement;

    it('should change the entry on the License list screen when changing the name', function () {
        browser.setLocation('/license');

        pageConfig.listFilterShowAll.click();

        element.all(by.repeater('entity in values'))
            .filter(function (el, index) {
                return el.getText().then(function (text) {
                    return (text.search(testLicenseName) > -1);
                });
            })
            .then(function (licenseList) {
                licenseList[0].element(by.tagName('a')).click();
            });

        pageConfig.editButton.click();

        pageConfig.fillInLicenseWithTestData('editedValue');

        pageConfig.submit.click();

        pageConfig.listFilterShowAll.click();

        element.all(by.repeater('entity in values'))
            .filter(function (el, index) {
                return el.getText().then(function (text) {
                    return (text.search(testLicenseEditedName) > -1);
                });
            })
            .then(function (licenseList) {
                expect( licenseList.length ).toBe(1);
                licenseList[0].element(by.tagName('a')).click();
            });
    });

    for ( formElement in formInputsTestConfig ){
        config = formInputsTestConfig[formElement];
        macro.ensureFormElementDisplaysText( config, config.editedValue );
    }
});