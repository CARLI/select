var config = require('./utils/baseConfig'),
dataLoader = require('./utils/fixtureDataLoader'),
  testData = require('./product.fixtures');

config.getDefaultAppPage();

dataLoader.createVendor(testData.vendor);
dataLoader.createLicense(testData.license);
config.getDefaultAppPage();

var macro = require('./utils/protractorMacros');

var browserEnsureElementIsPresentById = macro.browserEnsureElementIsPresentById;
var browserEnsureInputIsHidden = macro.browserEnsureInputIsHidden;
var browserEnsureInputHasValue = macro.browserEnsureInputHasValue;
var browserEnsureComponentHasText = macro.browserEnsureComponentHasText;
var browserGetFirstEntityListRowContainingText = macro.browserGetFirstEntityListRowContainingText;

/* These are special form elements because they aren't editable after creating the product */
var newProductOnlyFormInputsTestConfig = {
    vendorFormInput: {
        type: 'typeahead',
        description: 'Vendor Name',
        model: 'vm.product.vendor',
        defaultValue: '',
        initialValue: testData.vendor.name
    },
    licenseFormInput: {
        type: 'typeahead',
        description: 'License Name',
        model: 'vm.product.license',
        defaultValue: '',
        initialValue: testData.license.name
    },
    cycleType: {
        type: 'select',
        description: 'Cycle Type',
        model: 'vm.product.cycleType',
        defaultValue: '',
        initialValue: 'Fiscal Year'
    }
};

var formInputsTestConfig = {
    name: {
        type: 'input',
        description: 'Name',
        model: 'vm.product.name',
        defaultValue: '',
        initialValue: 'Test Product 1',
        editedValue: 'Change Product Name'
    },
    productUrl: {
        type: 'input',
        description: 'Product URL',
        model: 'vm.product.productUrl',
        defaultValue: '',
        initialValue: 'http://www.example.com',
        editedValue: 'http://www.example.net'
    },
    productDescription: {
        type: 'textarea',
        description: 'Product Description',
        model: 'vm.product.description',
        defaultValue: '',
        initialValue: 'This is a product description',
        editedValue: 'This is an edited product description'
    },
    comments: {
        type: 'textarea',
        description: 'Product Price Comments',
        model: 'vm.product.comments',
        defaultValue: '',
        initialValue: 'This is a comment',
        editedValue: 'This is an edited comment'
    },
    is3rdPartyProduct: {
        type: 'checkbox',
        description: 'Is 3rd Party Product',
        model: 'vm.product.isThirdPartyProduct',
        defaultValue: false,
        initialValue: true,
        initialText: 'Third Party Product: true',
        editedValue: false,
        editedText: 'Third Party Product: false'
    },
    isActive: {
        type: 'radio',
        description: 'isActive',
        model: 'vm.product.isActive',
        defaultValue: 'Active',
        initialText: 'Inactive Product',
        initialValue: 'Inactive',
        editedValue: 'Active',
        editedText: 'Active Product',
        valueToIndex: {
            'Active': 0,
            'Inactive': 1
        }
    },
    priceCap: {
        type: 'input',
        description: 'Price Cap',
        model: 'vm.product.priceCap',
        defaultValue: '',
        initialValue: '90',
        initialText: '90%',
        editedValue: '75',
        editedText: '75%'
    },
    detailCode: {
        type: 'select',
        description: 'Detail Code',
        model: 'vm.product.detailCode',
        defaultValue: '',
        initialValue: 'USIA - Membership',
        editedValue: 'USIH - OED'
    }
};

var testProductName = formInputsTestConfig.name.initialValue;
var testProductEditedName = formInputsTestConfig.name.editedValue;


var pageConfig = {
    listFilterShowAll: element(by.id('filter-all')),
    submit: element(by.id('product-submit')),
    editButton: element(by.id('product-edit')),
    newButtonId: 'new-product',
    newProductModal: element(by.id('new-product-modal')),

    vendorInput: element(by.model('vm.product.vendor')),

    fillInNewProductWithTestData: function(){
        for ( var formElement in newProductOnlyFormInputsTestConfig ){
            config = newProductOnlyFormInputsTestConfig[formElement];
            macro.setFormElementValue( config, config['initialValue'] );
        }
    },

    fillInProductWithTestData: function( useEditData ){
        var dataSet = useEditData || 'initialValue';

        for ( var formElement in formInputsTestConfig ){
            config = formInputsTestConfig[formElement];
            macro.setFormElementValue( config, config[dataSet] );
        }
    }
};


describe('The New Product Modal', function () {
    var config, formElement;

    it('should be routed at /product', function(){
        browser.setLocation('/product');
        browser.waitForAngular();
    });

    browserEnsureElementIsPresentById( pageConfig.newButtonId, 'New Product button' );

    it('should be displayed by clicking the New Product button', function () {
        element(by.id(pageConfig.newButtonId)).click();
        browser.sleep(500);
        expect(pageConfig.newProductModal.isDisplayed()).toBe(true);
    });

    for ( formElement in formInputsTestConfig ){
        config = formInputsTestConfig[formElement];
        browserEnsureInputHasValue( config, 'defaultValue' );
    }
});

describe('Creating a New Product', function(){
    it('should save a new Product when filling in the form and clicking save', function() {

        pageConfig.fillInNewProductWithTestData();
        pageConfig.fillInProductWithTestData();

        pageConfig.submit.click();
    });

    it('should go back to the list screen after submitting', function() {
        expect( browser.getLocationAbsUrl() ).toBe('/product');
    });

    it('should find the new Product in the list screen', function(){
        pageConfig.listFilterShowAll.click();

        var browserResult = browserGetFirstEntityListRowContainingText( testProductName );
        browserResult.then(function( testRow ){
            expect( testRow.isDisplayed()).toBe(true);
        });
    });
});


describe('Viewing an existing Product in read only mode', function () {
    var row, config, formElement, value;

    it('should find the Product entry on the Product list screen', function () {

        //Don't need to call these as long as the previous test left us on the list page with 'All' showing
        //browser.setLocation('/product');
        //pageConfig.listFilterShowAll.click();

        var browserResult = browserGetFirstEntityListRowContainingText( testProductName );
        browserResult.then(function( testRow ){
            testRow.findElement(by.tagName('a')).then(function(link){
                link.click();
            });
        });
    });

    for ( formElement in formInputsTestConfig ){
        browserEnsureInputIsHidden( formInputsTestConfig[formElement] );
    }

    for ( formElement in formInputsTestConfig ){
        config = formInputsTestConfig[formElement];
        value = config.initialText ? 'initialText' : 'initialValue';
        browserEnsureComponentHasText( config, value );
    }

    for ( formElement in newProductOnlyFormInputsTestConfig ){
        config = newProductOnlyFormInputsTestConfig[formElement];
        browserEnsureComponentHasText( config, 'initialValue' );
    }
});

describe('Viewing an existing Product in edit mode', function () {
    var config, formElement;

    it('should be in edit mode', function () {
        pageConfig.editButton.click();
    });

    for ( formElement in formInputsTestConfig ){
        config = formInputsTestConfig[formElement];
        browserEnsureInputHasValue( config, 'initialValue' );
    }
});

describe('Making changes to an existing Product', function(){
    var config, value, formElement;

    it('should find the Product entry on the Product list screen', function () {
        browser.setLocation('/product');

        pageConfig.listFilterShowAll.click();

        var browserResult = browserGetFirstEntityListRowContainingText( testProductName );
        browserResult.then(function( testRow ){
            testRow.findElement(by.tagName('a')).then(function(link){
                link.click();
            });
        });
    });

    it('should save changes to the Product entity and go back to the list screen', function () {
        pageConfig.editButton.click();

        pageConfig.fillInProductWithTestData('editedValue');

        pageConfig.submit.click();

        expect( browser.getLocationAbsUrl() ).toBe('/product');

        pageConfig.listFilterShowAll.click();
    });

    it('should change the entry on the Product list screen when changing the name', function () {
        var browserResult = browserGetFirstEntityListRowContainingText( testProductEditedName );
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
        browserEnsureComponentHasText( config, value );
    }
});
