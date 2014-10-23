var StyleGuidePage = function () {
};

describe('CARLI Style Guide', function () {

    var styleGuidePage = new StyleGuidePage();

    it('should be routed at /styleGuide', function(){
        browser.setLocation('/styleGuide');
    });

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
