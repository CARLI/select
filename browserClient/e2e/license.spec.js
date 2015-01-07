var config = require('./utils/baseConfig'),
    dataLoader = require('./utils/fixtureDataLoader'),
    testData = require('./license.fixtures');

config.getDefaultAppPage();

dataLoader.createVendor(testData.vendor1);
dataLoader.createVendor(testData.vendor2);

var macro = require('./utils/protractorMacros');
var browserEnsureInputIsHidden = macro.browserEnsureInputIsHidden;
var browserEnsureInputHasValue = macro.browserEnsureInputHasValue;
var browserEnsureComponentHasText = macro.browserEnsureComponentHasText;
var browserGetFirstEntityListRowContainingText = macro.browserGetFirstEntityListRowContainingText;

/* These are special form elements because they aren't editable after creating the license */
var newLicenseOnlyFormInputsTestConfig = {
    vendorFormInput: {
        type: 'typeahead',
        description: 'Vendor Name',
        model: 'vm.license.vendor',
        defaultValue: '',
        initialValue: testData.vendor1.name
    }
};

var formInputsTestConfig = {
    name: {
        type: 'input',
        description: 'Name',
        model: 'vm.license.name',
        defaultValue: '',
        initialValue: 'Test License 1',
        editedValue: 'Change License Name'
    },
    contractNumber: {
        type: 'input',
        description: 'Contract Number',
        model: 'vm.license.contractNumber',
        defaultValue: '',
        initialValue: 'Contract #1',
        editedValue: 'Contract #1.1'
    },
    redactedLicenseFile: {
        type: 'input',
        description: 'Redacted License',
        model: 'vm.license.redactedLicenseFile',
        defaultValue: '',
        initialValue: 'This will be a redacted file upload',
        editedValue: 'This will be a different redacted file upload'
    },
    fullLicenseFile: {
        type: 'input',
        description: 'Full License',
        model: 'vm.license.fullLicenseFile',
        defaultValue: '',
        initialValue: 'This will be a full license file upload',
        editedValue: 'This will be a different full license file upload'
    },
    eResourceComments: {
        type: 'textarea',
        description: 'Internal E-Resource Comments',
        model: 'vm.license.eResourceComments',
        defaultValue: '',
        initialValue: 'This is an Internal E-Resource Comment',
        editedValue: 'This is an edited Internal E-Resource Comment'
    },
    businessComments: {
        type: 'textarea',
        description: 'Internal Business Services',
        model: 'vm.license.businessComments',
        defaultValue: '',
        initialValue: 'This is an Internal Business Services',
        editedValue: 'This is an edited Internal Business Services'
    },
    isActive: {
        type: 'radio',
        description: 'isActive',
        model: 'vm.license.isActive',
        defaultValue: 'Active',
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
        defaultValue: '',
        initialValue: '10/31/14',
        editedValue: '12/25/14'
    },
    totalTermStartDate: {
        type: 'input',
        description: 'Total Contract Term Start',
        model: 'vm.license.totalTermStartDate',
        defaultValue: '',
        initialValue: '10/31/14',
        editedValue: '12/25/14'
    },
    totalTermEndDate: {
        type: 'input',
        description: 'Total Contract Term End',
        model: 'vm.license.totalTermEndDate',
        defaultValue: '',
        initialValue: '10/31/17',
        editedValue: '12/25/17'
    },
    currentTermStartDate: {
        type: 'input',
        description: 'Total Current Term Start',
        model: 'vm.license.currentTermStartDate',
        defaultValue: '',
        initialValue: '10/31/14',
        editedValue: '12/25/14'
    },
    currentTermEndDate: {
        type: 'input',
        description: 'Total Current Term End',
        model: 'vm.license.currentTermEndDate',
        defaultValue: '',
        initialValue: '10/31/15',
        editedValue: '12/25/15'
    },
    remainingRenewals: {
        type: 'input',
        description: 'Remaining Renewals',
        model: 'vm.license.remainingRenewals',
        defaultValue: '',
        initialValue: '12',
        editedValue: '32'
    },
    downloadTerms: {
        type: 'select',
        description: 'Download Terms',
        model: 'vm.license.terms.downloadTerms',
        defaultValue: '',
        initialValue: 'Yes',
        editedValue: 'Other'
    },
    coursePacksTerms: {
        type: 'select',
        description: 'Course Pack  Terms',
        model: 'vm.license.terms.coursePacksTerms',
        defaultValue: '',
        initialValue: 'No',
        editedValue: 'Other'
    },
    interLibraryLoanTerms: {
        type: 'select',
        description: 'Interlibrary Loan Terms',
        model: 'vm.license.terms.interLibraryLoanTerms',
        defaultValue: '',
        initialValue: 'Yes',
        editedValue: 'No'
    },
    printTerms: {
        type: 'select',
        description: 'Print Terms',
        model: 'vm.license.terms.printTerms',
        defaultValue: '',
        initialValue: 'No',
        editedValue: 'Yes'
    },
    limitedScholarlySharingTerms: {
        type: 'select',
        description: 'Limited Scholarly Sharing Terms',
        model: 'vm.license.terms.limitedScholarlySharingTerms',
        defaultValue: '',
        initialValue: 'Yes',
        editedValue: 'Other'
    },
    walkinTerms: {
        type: 'select',
        description: 'Use by Walkin Terms',
        model: 'vm.license.terms.walkinTerms',
        defaultValue: '',
        initialValue: 'Other',
        editedValue: 'No'
    },
    eReservesTerms: {
        type: 'select',
        description: 'E-Reserve Terms',
        model: 'vm.license.terms.eReservesTerms',
        defaultValue: '',
        initialValue: 'Other',
        editedValue: 'Yes'
    },
    hasConfidentialityLanguage: {
        type: 'select',
        description: 'Has Confidentiality Language',
        model: 'vm.license.terms.hasConfidentialityLanguage',
        defaultValue: '',
        initialValue: "Yes",
        editedValue: "No"
    },
    purchaseOrderNumber: {
        type: 'input',
        description: 'PO Number',
        model: 'vm.license.purchaseOrderNumber',
        defaultValue: '',
        initialValue: '20,000',
        editedValue: '30,000'
    },
    purchaseOrderAmount: {
        type: 'input',
        description: 'PO Amount',
        model: 'vm.license.purchaseOrderAmount',
        defaultValue: '',
        initialValue: '20,000',
        editedValue: '30,000'
    },
    bannerId: {
        type: 'input',
        description: 'Banner ID',
        model: 'vm.license.bannerId',
        defaultValue: '',
        initialValue: 'Banner ID X',
        editedValue: 'Banner ID 11343'
    },
    isRfp: {
        type: 'checkbox',
        description: 'Is RFP Type',
        model: 'vm.license.isRfp',
        defaultValue: false,
        initialValue: true,
        initialText: 'RFP: Yes',
        editedValue: false,
        editedText: 'RFP: No'
    },
    isSoleSource: {
        type: 'checkbox',
        description: 'Is Sole Source',
        model: 'vm.license.isSoleSource',
        defaultValue: false,
        initialValue: false,
        initialText: 'Sole Source: No',
        editedValue: true,
        editedText: 'Sole Source: Yes'
    },
    isSealedBid: {
        type: 'checkbox',
        description: 'Is Sealed Bid',
        model: 'vm.license.isSealedBid',
        defaultValue: false,
        initialValue: true,
        initialText: 'Sealed Bid: Yes',
        editedValue: false,
        editedText: 'Sealed Bid: No'
    },
    isOtherType: {
        type: 'checkbox',
        description: 'Is Other Type',
        model: 'vm.license.isOtherType',
        defaultValue: false,
        initialValue: false,
        initialText: 'Other: No',
        editedValue: true,
        editedText: 'Other: Yes'
    },
    otherType: {
        type: 'input',
        description: 'Other Type text',
        model: 'vm.license.otherType',
        defaultValue: '',
        initialValue: 'Other',
        editedValue: 'Other Other'
    },
    offeringType: {
        type: 'radio',
        description: 'Offering Type (Product/Service)',
        model: 'vm.license.offeringType',
        defaultValue: 'Product',
        initialValue: 'Product',
        editedValue: 'Service',
        valueToIndex: {
            'Product': 0,
            'Service': 1
        }
    }
};

testLicenseName = formInputsTestConfig.name.initialValue;
testLicenseEditedName = formInputsTestConfig.name.editedValue;

var pageConfig = {
    listFilterShowAll: element(by.id('filter-all')),
    submit: element(by.id('license-submit')),
    editButton: element(by.id('license-edit')),
    newButton: element(by.id('new-license')),
    newLicenseModal: element(by.id('new-license-modal')),

    fillInNewLicenseWithTestData: function(){
        for ( var formElement in newLicenseOnlyFormInputsTestConfig ){
            config = newLicenseOnlyFormInputsTestConfig[formElement];
            macro.setFormElementValue( config, config['initialValue'] );
        }
    },

    fillInLicenseWithTestData: function( useEditData ){
        var config, formElement;
        var dataSet = useEditData || 'initialValue';

        for ( formElement in formInputsTestConfig ){
            config = formInputsTestConfig[formElement];

            macro.setFormElementValue( config, config[dataSet] );
        }
    }
};



describe('The New License Modal', function () {
    var formElement;

    it('should be routed at /license', function(){
        browser.setLocation('/license');
        browser.waitForAngular();
    });
    macro.ensureElementIsPresent( pageConfig.newButton, 'New License button' );

    it('should be displayed by clicking the New License button', function () {
        pageConfig.newButton.click();
        browser.sleep(500);
        expect(pageConfig.newLicenseModal.isDisplayed()).toBe(true);
    });

    for ( formElement in formInputsTestConfig ){
        browserEnsureInputHasValue( formInputsTestConfig[formElement], 'defaultValue' );
    }
});

describe('Creating a New License', function(){
    it('should save a new License when filling in the form and clicking save', function() {
        pageConfig.fillInNewLicenseWithTestData();
        pageConfig.fillInLicenseWithTestData('initialValue');
        pageConfig.submit.click();
    });

    it('should go back to the list screen after submitting', function() {
        expect( browser.getLocationAbsUrl() ).toBe('/license');
    });

    it('should find the new License in the list screen', function(){
        pageConfig.listFilterShowAll.click();
        browser.waitForAngular();
        var browserResult = browserGetFirstEntityListRowContainingText( testLicenseName );
        browserResult.then(function( testRow ){
            expect( testRow.isDisplayed()).toBe(true);
        });
    });
});

describe('Viewing an existing License in read only mode', function () {
    var value, config, formElement;

    it('should find the License entry on the list screen', function () {

        //Don't need to call these as long as the previous test left us on the list page with 'All' showing
        //browser.setLocation('/license');
        //pageConfig.listFilterShowAll.click();
        //browser.waitForAngular();
        var browserResult = browserGetFirstEntityListRowContainingText( testLicenseName );
        browserResult.then(function( testRow ){
            testRow.findElement(by.tagName('a')).then(function(link){
                link.click();
                browser.waitForAngular();
            });
        });
    });

    for ( formElement in formInputsTestConfig ){
        browserEnsureInputIsHidden( formInputsTestConfig[formElement] );
    }

    for ( formElement in formInputsTestConfig ){
        config = formInputsTestConfig[formElement];
        value = config.initialText ? 'initialText' : 'initialValue';
        browserEnsureComponentHasText( formInputsTestConfig[formElement], value );
    }

    for ( formElement in newLicenseOnlyFormInputsTestConfig ){
        config = newLicenseOnlyFormInputsTestConfig[formElement];
        browserEnsureComponentHasText( config, 'initialValue' );
    }
});

describe('Viewing an existing License in edit mode', function () {
    var config, formElement;

    it('should be in edit mode', function () {
        pageConfig.editButton.click();
    });

    for ( formElement in formInputsTestConfig ){
        config = formInputsTestConfig[formElement];
        browserEnsureInputHasValue( config, 'initialValue' );
    }
});

describe('Making changes to an existing License', function(){
    var config, value, formElement;

    it('should find the License entry on the list screen', function () {
        browser.setLocation('/license');

        pageConfig.listFilterShowAll.click();
        browser.waitForAngular();
        var browserResult = browserGetFirstEntityListRowContainingText( testLicenseName );
        browserResult.then(function( testRow ){
            testRow.findElement(by.tagName('a')).then(function(link){
                link.click();
                browser.waitForAngular();
            });
        });
    });

    it('should save changes to the License entity and go back to the list screen', function () {
        pageConfig.editButton.click();

        pageConfig.fillInLicenseWithTestData('editedValue');

        pageConfig.submit.click();

        expect( browser.getLocationAbsUrl() ).toBe('/license');

        pageConfig.listFilterShowAll.click();
    });

    it('should change the entry on the License list screen when changing the name', function () {
        var browserResult = browserGetFirstEntityListRowContainingText( testLicenseEditedName );
        browserResult.then(function( testRow ){
            testRow.findElement(by.tagName('a')).then(function(link){
                link.click();
                browser.waitForAngular();
            });
        });
    });

    for ( formElement in formInputsTestConfig ){
        config = formInputsTestConfig[formElement];
        value = config.initialText ? 'editedText' : 'editedValue';
        browserEnsureComponentHasText( formInputsTestConfig[formElement], value );
    }
});
