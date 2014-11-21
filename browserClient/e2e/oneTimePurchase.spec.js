
var testLibrary;

describe('The One-Time Purchases screen', function () {

    it('should be routed at /oneTimePurchases', function(){
        browser.setLocation('/oneTimePurchases');
    });

    it('should have an Entity List', function () {
        expect(element(by.repeater('entity in values')).isPresent()).toBe(true);
    });

    it("should have a library called 'Test Library 5' in the fixture data/entity list", function () {
        element.all(by.repeater('entity in values'))
            .filter( function(el, index) {
                return el.getText().then(function(text){
                    return (text.search('Test Library 5') > -1);
                });
            })
            .then( function( libraryList ) {
                expect( libraryList.length ).toBe(1);
                testLibrary = libraryList[0];
            });
    });

    it("should have a View button for Test Library 5", function () {
        element.all(by.repeater('entity in values'))
            .filter( function(el, index) {
                return el.getText().then(function(text){
                    return (text.search('Test Library 5') > -1);
                });
            })
            .then( function( libraryList ) {
                expect( libraryList[0].element(by.css('.carli-button')).isPresent()).toBe(true);
            });
    });

    it("should go to the One-Time Purchase select product page when the 'Test Library 5' View button is clicked", function () {
        element.all(by.repeater('entity in values'))
            .filter( function(el, index) {
                return el.getText().then(function(text){
                    return (text.search('Test Library 5') > -1);
                });
            })
            .then( function( libraryList ) {
                var testLibraryViewButton = libraryList[0].element(by.css('.carli-button'));

                var libraryId = testLibraryViewButton.getAttribute('href').then(function (url) {

                    testLibraryViewButton.click();

                    // This is a bit contrived, but we are finding the URL specified in the button, which
                    // contains the library id of the selected library, to verify that we are going to
                    // that URL (the select product page).  However, this is the only place this library Id is,
                    // so we have to trust it's right, and then use that to make sure the data in the
                    // select product page is correct.
                    var location = '\/' + url.match('http:\/\/[^\/]+\/(.*)')[1];  // Location part of URL
                    expect(browser.getLocationAbsUrl() ).toBe(location);

                    // extract the library Id
                    id = location.match('(.*?\/){2}(.*)')[2];
                    return id;
                });
            });
    });

});