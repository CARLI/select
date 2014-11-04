var ListLibraryPage = require('./ListLibraryPage.spec');

describe('The List Library screen', function () {
    var listLibraryPage = new ListLibraryPage();

    it('should be routed at /library', function(){
        browser.setLocation('/library');
    });

    it('should have an update FTE button', function () {
        expect(listLibraryPage.updateFteButton.isPresent()).toBe(true);
    });

});
