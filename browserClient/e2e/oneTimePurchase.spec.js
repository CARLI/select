var testData = require('./oneTimePurchaseFixtures');

var dataLoader = require('./fixtureDataLoader');

dataLoader.createLibrary(testData.activeLibrary1);
dataLoader.createLibrary(testData.inactiveLibrary2);
dataLoader.createLibrary(testData.activeLibrary3);

var nameColIndex=0;
var fteColIndex=1;
var instTypeColIndex=2;

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
                        expect( colList[nameColIndex].getText()).toBe(testData.activeLibrary1.name);
                        expect( colList[fteColIndex].getText()).toBe(testData.activeLibrary1.fte.toString());
                        expect( colList[instTypeColIndex].getText()).toBe(testData.activeLibrary1.institutionType);
                });

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

    it('should only contain products of type cycleType One-Time Purchase', function(){
        element.all(by.repeater('product in vm.productList'))
            .then( function( productList ) {
                console.log("productList=" + JSON.stringify(productList));
                for (var i=0; i<productList.length; i++) {
                    console.log("product=" + JSON.stringify(productList[i]));
                    console.log("product.cycleType=" + productList[i].cycleType);
                    expect( productList[i].cycleType ).toBe("One-Time Purchase");
                }
            });

    });

});
    */