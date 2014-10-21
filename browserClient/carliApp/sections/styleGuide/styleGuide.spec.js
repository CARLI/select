
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

    describe('Contact Editor', function() {
        var contactEditor;
        it('should exist', function() {
            contactEditor = element(by.tagName('contact-editor'));
            expect( contactEditor.isPresent() ).toBe(true);
        });
        it('should have a name field', function () {
            var field = contactEditor.element(by.model('contact.name'));
            expect( field.isPresent() ).toBe(true);
            expect( field.getTagName() ).toBe('input');
        });
        it('should have a email field', function () {
            var field = contactEditor.element(by.model('contact.email'));
            expect( field.isPresent() ).toBe(true);
            expect( field.getTagName() ).toBe('input');
        });
        it('should have a phoneNumber field', function () {
            var field = contactEditor.element(by.model('contact.phoneNumber'));
            expect( field.isPresent() ).toBe(true);
            expect( field.getTagName() ).toBe('input');
        });
    });
});
