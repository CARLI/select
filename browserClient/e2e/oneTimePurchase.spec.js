var config = require('./utils/baseConfig'),
    dataLoader = require('./utils/fixtureDataLoader'),
    testData = require('./oneTimePurchase.fixtures'),
    macro = require('./utils/protractorMacros');

browserEnsureElementIsPresentByTagName = macro.browserEnsureElementIsPresentByTagName;

config.getDefaultAppPage();

var otpCycle = { databaseName: 'cycle-test-db-marker-otp-tests' };

dataLoader.createLibrary(testData.activeLibrary1);
dataLoader.createLibrary(testData.inactiveLibrary2);
dataLoader.createLibrary(testData.activeLibrary3);
dataLoader.createVendor(testData.activeVendor1);
dataLoader.createLicense(testData.activeLicense1);
dataLoader.createProduct(testData.activePurchasedProduct1, otpCycle);
dataLoader.createProduct(testData.inactiveProduct2, otpCycle);
dataLoader.createProduct(testData.activeFiscalYearProduct3, otpCycle);

var NAME_COLUMN_INDEX=0;
var FTE_COLUMN_INDEX=1;
var INSTITUTION_TYPE_COLUMN_INDEX=2;

var PRODUCT_COLUMN_INDEX=0;
var VENDOR_COLUMN_INDEX=1;
var PRICE_COLUMN_INDEX=2;

describe('The One-Time Purchases screen', function () {

    it('should be routed at /oneTimePurchases', function(){
        browser.setLocation('/oneTimePurchases');
        browser.waitForAngular();
    });

    browserEnsureElementIsPresentByTagName('entity-list', 'Entity List' );

    it("should only display active libraries", function () {
        element.all(by.repeater('entity in values'))
            .then( function( libraryList ) {
                for (i=0; i<libraryList.length; i++) {
                    expect(libraryList[i].getText()).toNotContain(testData.inactiveLibrary2.name);
                }
            });
    });

    //it("should have a library " + testData.activeLibrary1.name + " in the entity list with FTE and Institution Type columns", function () {
    //    element.all(by.repeater('entity in values'))
    //        .filter( function(el, index) {
    //            return el.getText().then(function(text){
    //                return (text.search(testData.activeLibrary1.name) > -1);
    //            });
    //        })
    //        .then( function( libraryList ) {
    //
    //            libraryList[0].all(by.repeater('column in columns'))
    //                .then (function(colList) {
    //                    expect( colList[NAME_COLUMN_INDEX].getText()).toBe(testData.activeLibrary1.name);
    //                    expect( colList[FTE_COLUMN_INDEX].getText()).toBe(testData.activeLibrary1.fte.toString());
    //                    expect( colList[INSTITUTION_TYPE_COLUMN_INDEX].getText()).toBe(testData.activeLibrary1.institutionType);
    //            });
    //
    //        });
    //});

    it("should search by name only, (not include other field values)", function () {

        // activeLibrary3 has "Other" in a non-name field -- should not appear in list if searching on Other
        inputSearch = macro.elementByModel("vm.filterText");
        macro.setInputValue(inputSearch, "Other");
        element.all(by.repeater('entity in values'))
            .then( function( libraryList ) {
                for (i=0; i<libraryList.length; i++) {
                    expect(libraryList[i].getText()).toNotContain(testData.activeLibrary3.name);
                }
            });

        // Search using UUID of library 1 -- should list only that library
        macro.setInputValue(inputSearch, testData.activeLibrary1.name);
        element.all(by.repeater('entity in values'))
            .then( function( libraryList ) {
                expect(libraryList[0].getText()).toContain(testData.activeLibrary1.name);
            });
        macro.setInputValue(inputSearch, "");

    });


    it("should go to the One-Time Purchase select product page when the View button is clicked", function () {
        element.all(by.repeater('entity in values'))
            .filter( function(el, index) {
                return el.getText().then(function(text){
                    return (text.search(testData.activeLibrary1.name) > -1);
                });
            })
            .then( function( libraryList ) {
                libraryList[0].element(by.css('.carli-button')).click()
                    .then(function() {
                        expect(element(by.id('one-time-purchase-products')).isPresent()).toBe(true);
                });

            });
    });

});


describe('The One-Time Purchases Select Product screen', function () {

    it('should contain only active products', function(){
        element.all(by.repeater('product in vm.productList'))
            .then( function(productList ) {
                for (i=0; i<productList.length; i++) {
                    expect(productList[i].getText()).toNotContain(testData.inactiveProduct2.name);
                }
            });
    });

    it('should only contain products of type cycleType One-Time Purchase', function(){
        element.all(by.repeater('product in vm.productList'))
            .then( function(productList ) {
                for (i=0; i<productList.length; i++) {
                    expect(productList[i].getText()).toNotContain(testData.activeFiscalYearProduct3.name);
                }
            });
    });

    it("should contain the correct field values for '"+testData.activePurchasedProduct1.name+"' in the fixture data", function(){

        element.all(by.repeater('product in vm.productList'))
            .filter( function(el, index) {
                return el.getText().then(function(text){
                    return (text.search(testData.activePurchasedProduct1.name) > -1);
                });
            })
            .then( function( productList ) {


                // Find the columns in the product list and verify each field contains what the fixture
                // data says it should.
                productList[0].all(by.className('column'))
                    .then (function(colList) {


                    // how to print debug:
                    /*
                    console.log("colListLength=" + colList.length);
                    colList[0].getText().then( function( text ) {
                        console.log("colList[0] text = " + text);
                    });
                    */

                    expect( colList[PRODUCT_COLUMN_INDEX].getText()).toBe(testData.activePurchasedProduct1.name);
                    expect( colList[VENDOR_COLUMN_INDEX].getText()).toBe(testData.activeVendor1.name);
                    colList[PRICE_COLUMN_INDEX].getText().then( function ( text ) {
                        // Price is formatted as currency (e.g., $2500.00), so need to convert to the actual number value
                        var priceText = text.replace(/[$,]+/g,"");
                        var price = parseFloat(priceText);
                        var lib1Id =  testData.activeLibrary1.id;
                        expect (price).toEqual(testData.activePurchasedProduct1.oneTimePurchase.libraryPurchaseData[lib1Id].price);
                    });

                });
            });
    });


});

