var VendorPage = function () {
    this.nameInput = element(by.model('vm.vendor.name'));
    this.websiteInput = element(by.model('vm.vendor.websiteUrl'));
    this.commentsInput = element(by.model('vm.vendor.comments'));
    this.adminModuleInput = element(by.model('vm.vendor.adminModule'));
    this.statusInputs = element.all(by.model('vm.vendor.isActive'));
    this.addBillingContactLink = element(by.id('add-billing-contact'));
    this.addSalesContactLink = element(by.id('add-sales-contact'));
    this.addTechnicalContactLink = element(by.id('add-technical-contact'));
};

module.exports = VendorPage;
