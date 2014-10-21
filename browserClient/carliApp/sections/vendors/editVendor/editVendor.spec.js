var NewVendorPage = function () {
    this.nameInput = element(by.model('vm.vendor.name'));
    this.websiteInput = element(by.model('vm.vendor.websiteUrl'));
    this.commentsInput = element(by.model('vm.vendor.comments'));
    this.adminModuleInput = element(by.model('vm.vendor.adminModule'));
    this.statusInputs = element.all(by.model('vm.vendor.isActive'));

    this.get = function () {
        browser.get('http://0.0.0.0:8000/vendor/new');
    };
};

describe('The new vendor screen', function () {

    var newVendorPage = new NewVendorPage();
    newVendorPage.get();

    it('should have a blank name input field', function () {
        expect(newVendorPage.nameInput.isPresent()).toBe(true);
        expect(newVendorPage.nameInput.getTagName()).toBe('input');
        expect(newVendorPage.nameInput.getText()).toBe('');
    });

    it('should have a blank Website input field', function () {
        expect(newVendorPage.websiteInput.isPresent()).toBe(true);
        expect(newVendorPage.websiteInput.getTagName()).toBe('input');
        expect(newVendorPage.websiteInput.getText()).toBe('');
    });

    it('should have a blank Comments textarea', function () {
        expect(newVendorPage.commentsInput.isPresent()).toBe(true);
        expect(newVendorPage.commentsInput.getTagName()).toBe('textarea');
        expect(newVendorPage.commentsInput.getText()).toBe('');
    });

    it('should have a blank Admin Module textarea', function () {
        expect(newVendorPage.adminModuleInput.isPresent()).toBe(true);
        expect(newVendorPage.adminModuleInput.getTagName()).toBe('textarea');
        expect(newVendorPage.adminModuleInput.getText()).toBe('');
    });

    it('should have a active / inactive control', function () {
        newVendorPage.statusInputs.then(function(items) {
            expect(items.length).toBe(2);
            expect(items[0].getAttribute('type')).toBe('radio');
            expect(items[1].getAttribute('type')).toBe('radio');
        });
    });
});
