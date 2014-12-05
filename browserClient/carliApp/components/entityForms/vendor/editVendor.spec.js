
describe('The Edit Vendor Directive', function(){

    var newCtrl, editCtrl, mockDependenciesForNewVendor, mockDependenciesForEditVendor;

    var mockVendorList = [
        {
            type: 'Vendor',
            name: 'Test Vendor',
            contacts: [
                {
                    "contactType": "Billing",
                    "name": "Bob Martin",
                    "email": "bob@cleancode.org",
                    "phoneNumber": "123-555-1234"
                },
                {
                    "contactType": "Empty"
                }
            ]

        }
    ];

    beforeEach(function(){
        module('carli.entityForms.vendor');
        module('carli.mockServices');

        inject( function($controller, $rootScope, $q, mockLocationService, mockVendorService, mockAlertService ) {

            mockVendorService.setTestData(angular.copy(mockVendorList));

            mockDependenciesForNewVendor = {
                $scope: {},
                $location: mockLocationService,
                vendorService: mockVendorService,
                alertService: mockAlertService
            };

            mockDependenciesForEditVendor = {
                $scope: {
                    vendorId: 'xxxxx'
                },
                $location: mockLocationService,
                vendorService: mockVendorService,
                alertService: mockAlertService
            };

            newCtrl  = $controller('editVendorController', mockDependenciesForNewVendor);
            editCtrl = $controller('editVendorController', mockDependenciesForEditVendor);
            $rootScope.$digest();
        });
    });

    it('should have a default, editable Vendor on the New Vendor screen', function(){
        expect( newCtrl.vendor.isActive ).to.equal(true);
        expect( newCtrl.editable ).to.equal(true);
        expect( newCtrl.newVendor ).to.equal(true);
    });

    it('should remove empty contacts when saving a new vendor', function(){
        expect( newCtrl.vendor.contacts.length ).to.equal(3);
        newCtrl.saveVendor();
        expect( newCtrl.vendor.contacts.length ).to.equal(0);
    });

    it('should call vendorService.create when saving a new Vendor', function(){
        expect( mockDependenciesForNewVendor.vendorService.createOrUpdate ).to.equal('neither');
        newCtrl.saveVendor();
        expect( mockDependenciesForNewVendor.vendorService.createOrUpdate ).to.equal('create');
    });

    it('should add an alert when saving a new Vendor', inject(function($rootScope){
        expect( mockDependenciesForNewVendor.alertService.alertCount ).to.equal( 0 );
        newCtrl.saveVendor();
        $rootScope.$digest();
        expect( mockDependenciesForNewVendor.alertService.alertCount ).to.equal( 1 );
    }));

    it('should have a known, non-editable Vendor on the Edit Vendor screen', function(){
        expect( editCtrl.vendor.name ).to.equal('Test Vendor');
        expect( editCtrl.editable ).to.equal(false);
        expect( editCtrl.newVendor ).to.equal(false);
    });

    it('should remove empty contacts when editing a vendor', function(){
        expect( editCtrl.vendor.contacts.length ).to.equal(2);
        editCtrl.saveVendor();
        expect( editCtrl.vendor.contacts.length ).to.equal(1);
    });

    it('should call vendorService.update when saving an existing Vendor', function(){
        expect( mockDependenciesForEditVendor.vendorService.createOrUpdate ).to.equal('neither');
        editCtrl.saveVendor();
        expect( mockDependenciesForEditVendor.vendorService.createOrUpdate ).to.equal('update');
    });

    it('should add an alert when saving an existing Vendor', inject(function($rootScope){
        expect( mockDependenciesForEditVendor.alertService.alertCount ).to.equal( 0 );
        editCtrl.saveVendor();
        $rootScope.$digest();
        expect( mockDependenciesForEditVendor.alertService.alertCount ).to.equal( 1 );
    }));

    it('should toggle the editable variable when calling toggleEditable()', function(){
        expect( editCtrl.editable ).to.equal(false);
        editCtrl.toggleEditable();
        expect( editCtrl.editable ).to.equal(true);
    });

    it('should be able to delete the first Billing contact', function(){
        var contacts = editCtrl.vendor.contacts;
        var firstBillingContact = findFirstBillingContact(contacts);
        var initialLength = contacts.length;

        editCtrl.deleteContact(firstBillingContact);
        expect( contacts.length ).to.equal(initialLength - 1);
    });

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
