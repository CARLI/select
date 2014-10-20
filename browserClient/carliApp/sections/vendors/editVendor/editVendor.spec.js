var NewVendorPage = function () {
    this.nameInput = element(by.model('editVendorController.vendor.name'));
    this.websiteInput = element(by.model('editVendorController.vendor.websiteUrl'));
    this.commentsInput = element(by.model('editVendorController.vendor.comments'));
    this.adminModuleInput = element(by.model('editVendorController.vendor.adminModule'));
    this.statusInput = element(by.model('editVendorController.vendor.isActive'));

    this.get = function () {
        browser.get('http://0.0.0.0:8000/vendors/new');
    };
};

describe('The new vendor screen', function () {

    var newVendorPage = new NewVendorPage();
    newVendorPage.get();

    it('should have a name field', function () {
        expect(newVendorPage.nameInput.isPresent()).toBe(true);
    });

    it('should have a Website field', function () {
        expect(newVendorPage.websiteInput.isPresent()).toBe(true);
    });

    it('should have a Comments field', function () {
        expect(newVendorPage.commentsInput.isPresent()).toBe(true);
    });

    it('should have a Admin Module field', function () {
        expect(newVendorPage.adminModuleInput.isPresent()).toBe(true);
    });

    it('should have a active / inactive control', function () {
        expect(newVendorPage.statusInput.isPresent()).toBe(true);
    });
});
