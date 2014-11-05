var ListLibraryPage = require('./ListLibraryPage.spec');

describe('The List Library screen', function () {
    var listLibraryPage = new ListLibraryPage();

    it('should be routed at /library', function(){
        browser.setLocation('/library');
    });

    it('should have an update FTE button', function () {
        expect(listLibraryPage.updateFteButton.isPresent()).toBe(true);
    });

    describe('the FTE modal dialog', function () {
        it('should be displayed by clicking the update FTE button', function () {
            listLibraryPage.updateFteButton.click();
            browser.sleep(500);
            expect(listLibraryPage.editFteModal.isDisplayed()).toBe(true);
        });
        it('should be closed when the ESC key is pressed', function () {
            listLibraryPage.editFteModal.sendKeys(protractor.Key.ESCAPE);
            browser.sleep(500);
            expect(listLibraryPage.editFteModal.isDisplayed()).toBe(false);
        });
    });
});
