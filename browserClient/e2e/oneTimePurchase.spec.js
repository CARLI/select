var config = require('./utils/baseConfig'),
    dataLoader = require('./utils/fixtureDataLoader'),
    testData = require('./oneTimePurchase.fixtures'),
    macro = require('./utils/protractorMacros');

config.getDefaultAppPage();

dataLoader.createLibrary(testData.activeLibrary1);
dataLoader.createLibrary(testData.inactiveLibrary2);
dataLoader.createLibrary(testData.activeLibrary3);
dataLoader.createVendor(testData.activeVendor1);
dataLoader.createProduct(testData.activePurchasedProduct1);

var NAME_COLUMN_INDEX=0;
var FTE_COLUMN_INDEX=1;
var INSTITUTION_TYPE_COLUMN_INDEX=2;

describe('The One-Time Purchases screen', function () {

    it('should be routed at /oneTimePurchases', function(){
        browser.setLocation('/oneTimePurchases');
    });

    it('should have an Entity List', function () {
        expect(element(by.repeater('entity in values')).isPresent()).toBe(true);
    });

    it("should only display active libraries", function () {
        element.all(by.repeater('entity in values'))
            .then( function( libraryList ) {
                for (i=0; i<libraryList.length; i++) {
                    expect(libraryList[i].getText()).toNotContain(testData.inactiveLibrary2.name);
                }
            });
    });

    it("should have a library " + testData.activeLibrary1.name + " in the entity list with FTE and Institution Type columns", function () {
        element.all(by.repeater('entity in values'))
            .filter( function(el, index) {
                return el.getText().then(function(text){
                    return (text.search(testData.activeLibrary1.name) > -1);
                });
            })
            .then( function( libraryList ) {

                libraryList[0].all(by.repeater('column in columns'))
                    .then (function(colList) {
                        expect( colList[NAME_COLUMN_INDEX].getText()).toBe(testData.activeLibrary1.name);
                        expect( colList[FTE_COLUMN_INDEX].getText()).toBe(testData.activeLibrary1.fte.toString());
                        expect( colList[INSTITUTION_TYPE_COLUMN_INDEX].getText()).toBe(testData.activeLibrary1.institutionType);
                });

            });
    });

    it("should search by name only, (not include other field values)", function () {

        // activeLibrary3 has "Other" in a non-name field -- should not appear in list if searching on Other
        inputSearch = macro.elementByModel("filterText");
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

/*
describe('The One-Time Purchases Select Product screen', function () {

    console.log('activePurchasedProduct1=' + JSON.stringify(testData.activePurchasedProduct1));

    it('should only contain products of type cycleType One-Time Purchase', function(){
        element.all(by.repeater('product in vm.productList'))
            .filter( function(el, index) {
                return el.getText().then(function(text){
                    return (text.search(testData.activePurchasedProduct1.name) > -1);
                });
            })
            .then( function( productList ) {


                //productList[0].element(by.id('product-name')).getText().then(function(text) {
                //    console.log("prod name=" + text);
                //});


                // This attempts to find a field in the list by name, but doesn't work because ids need to be unique per DOM
                expect( productList[0].element(by.id('product-name')).getText()).toBe(testData.activePurchasedProduct1.name);


                // This attempts to find the columns in the product list and verify each field contains what the fixture
                // data says it should.  I think name currently works, but the others don't.
                productList[0].all(by.className('column'))
                    .then (function(colList) {
          console.log("colListLength=" + colList.length);
                    var lib1Name =  testData.activeLibrary1.name;
          console.log("lib1Name=" + lib1Name);
          console.log("column[0]=" + colList[0].getText());

           console.log("calling expect, prod name = " + testData.activePurchasedProduct1.name);
                    expect( colList[0].getText()).toBe(testData.activePurchasedProduct1.name);
           console.log("calling expect, vendor name = " + testData.activePurchasedProduct1.vendor.name);
                    expect( colList[1].getText()).toBe(testData.activePurchasedProduct1.vendor.name);
           console.log("cost=" + testData.activePurchasedProduct1.oneTimePurchase.libraryPurchaseData[lib1Name].price);
                    expect( colList[2].getText()).toBe(testData.activePurchasedProduct1.oneTimePurchase.libraryPurchaseData[lib1Name].price);
                });
            });
    });



});

    */