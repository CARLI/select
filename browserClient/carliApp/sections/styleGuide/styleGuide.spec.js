var StyleGuidePage = function () {
    this.get = function () {
        browser.get('http://0.0.0.0:8000/styleGuide');
    };
};

describe('CARLI Style Guide', function () {
    it ('should have a title', function () {
        var styleGuidePage = new StyleGuidePage();
        styleGuidePage.get();

        expect(browser.getTitle()).toEqual('CARLI Select');
    });
});
