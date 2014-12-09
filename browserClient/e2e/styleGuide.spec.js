var config = require('./utils/baseConfig');
config.getDefaultAppPage();

var StyleGuidePage = function () {
};

xdescribe('CARLI Style Guide', function () {

    var styleGuidePage = new StyleGuidePage();

    it('should be routed at /styleGuide', function(){
        browser.setLocation('/styleGuide');
    });

    it('should have a title', function () {
        expect(browser.getTitle()).toEqual('CARLI Select');
    });

    describe('View/Edit Contact', function() {
        var viewEditContact;
        it('should exist', function() {
            viewEditContact = element(by.tagName('view-edit-contact'));
            expect( viewEditContact.isPresent() ).toBe(true);
        });
        it('should have a name field', function () {
            var field = viewEditContact.element(by.model('contact.name'));
            expect( field.isPresent() ).toBe(true);
            expect( field.getTagName() ).toBe('input');
        });
        it('should have a email field', function () {
            var field = viewEditContact.element(by.model('contact.email'));
            expect( field.isPresent() ).toBe(true);
            expect( field.getTagName() ).toBe('input');
        });
        it('should have a phoneNumber field', function () {
            var field = viewEditContact.element(by.model('contact.phoneNumber'));
            expect( field.isPresent() ).toBe(true);
            expect( field.getTagName() ).toBe('input');
        });
    });
});
