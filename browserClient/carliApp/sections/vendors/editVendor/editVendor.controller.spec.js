
describe('The Edit Vendor Controller', function(){

    var mockLocation = {
        path: function(){}
    };

    var mockVendorService = {
        createOrUpdate: 'neither',
        create: function(){
            this.createOrUpdate = 'create';
            return { then: function(callback) { callback(); } };
        },
        update: function(){
            this.createOrUpdate = 'update';
            return { then: function(callback) { callback(); } };
        },
        load: function(){
            return {
                name: 'Test Vendor',
                "contacts": [
                    {
                        "contactType": "Billing",
                        "name": "Bob Martin",
                        "email": "bob@cleancode.org",
                        "phoneNumber": "123-555-1234"
                    }
                ]
            };
        },
        reset: function(){
            this.createOrUpdate = 'neither';
        }
    };

    var mockAlertService = {
        alertCount: 0,
        putAlert: function(){
            this.alertCount++;
        },
        reset: function(){
            this.alertCount = 0;
        }
    };

    var mockDependenciesForNewVendor = {
        $location: mockLocation,
        $routeParams: {
            id: 'new'
        },
        vendorService: mockVendorService,
        alertService: mockAlertService
    };

    var mockDependenciesForEditVendor = {
        $location: mockLocation,
        $routeParams: {
            id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
        },
        vendorService: mockVendorService,
        alertService: mockAlertService
    };

    beforeEach(module('carli.sections.vendors.edit'));
    afterEach(function(){
        mockVendorService.reset();
        mockAlertService.reset();
    });

    it('should have a default, editable Vendor on the New Vendor screen', inject(function($controller){
        var editCtrl = $controller('editVendorController', mockDependenciesForNewVendor);
        expect( editCtrl.vendor.isActive ).to.equal(true);
        expect( editCtrl.editable ).to.equal(true);
        expect( editCtrl.newVendor ).to.equal(true);
    }));

    it('should call vendorService.create when saving a new Vendor', inject(function($controller){
        var editCtrl = $controller('editVendorController', mockDependenciesForNewVendor);
        expect( mockDependenciesForNewVendor.vendorService.createOrUpdate ).to.equal('neither');
        editCtrl.saveVendor();
        expect( mockDependenciesForNewVendor.vendorService.createOrUpdate ).to.equal('create');
    }));

    it('should add an alert when saving a new Vendor', inject(function($controller){
        var editCtrl = $controller('editVendorController', mockDependenciesForNewVendor);
        expect( mockDependenciesForNewVendor.alertService.alertCount ).to.equal( 0 );
        editCtrl.saveVendor();
        expect( mockDependenciesForNewVendor.alertService.alertCount ).to.equal( 1 );
    }));

    it('should have a known, non-editable Vendor on the Edit Vendor screen', inject(function($controller){
        var editCtrl = $controller('editVendorController', mockDependenciesForEditVendor);
        expect( editCtrl.vendor.name ).to.equal('Test Vendor');
        expect( editCtrl.editable ).to.equal(false);
        expect( editCtrl.newVendor ).to.equal(false);
    }));

    it('should call vendorService.update when saving an existing Vendor', inject(function($controller){
        var editCtrl = $controller('editVendorController', mockDependenciesForEditVendor);
        expect( mockDependenciesForEditVendor.vendorService.createOrUpdate ).to.equal('neither');
        editCtrl.saveVendor();
        expect( mockDependenciesForEditVendor.vendorService.createOrUpdate ).to.equal('update');
    }));

    it('should add an alert when saving an existing Vendor', inject(function($controller){
        var editCtrl = $controller('editVendorController', mockDependenciesForNewVendor);
        expect( mockDependenciesForNewVendor.alertService.alertCount ).to.equal( 0 );
        editCtrl.saveVendor();
        expect( mockDependenciesForNewVendor.alertService.alertCount ).to.equal( 1 );
    }));

    it('should toggle the editable variable when calling toggleEditable()', inject(function($controller){
        var editCtrl = $controller('editVendorController', mockDependenciesForEditVendor);
        expect( editCtrl.editable ).to.equal(false);
        editCtrl.toggleEditable();
        expect( editCtrl.editable ).to.equal(true);
    }));

    it('should be able to delete the first Billing contact', inject(function($controller) {
        var editCtrl = $controller('editVendorController', mockDependenciesForEditVendor);
        var contacts = editCtrl.vendor.contacts;
        var firstBillingContact = findFirstBillingContact(contacts);
        var initialLength = contacts.length;

        editCtrl.deleteContact(firstBillingContact);
        expect( contacts.length ).to.equal(initialLength - 1);
    }));

});

function findFirstBillingContact(contacts) {
    var firstBillingContact = null;
    for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].contactType === 'Billing') {
            firstBillingContact = contacts[i];
            break;
        }
    }
    return firstBillingContact;
}
