
var ip = require('ip');
var devServerUrl = 'http://' + ip.address() + ':8000';

var StyleGuidePage = function () {
    this.get = function () {
        browser.get(devServerUrl + '/styleGuide');
    };
};

describe('CARLI Style Guide', function () {

    var styleGuidePage = new StyleGuidePage();
    styleGuidePage.get();

    it('should have a title', function () {
        expect(browser.getTitle()).toEqual('CARLI Select');
    });
});
