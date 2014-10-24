describe('The Edit Vendor Controller', function(){

    var mockDependenciesForNewVendor = {
        $location: {},
        $routeParams: {
            id: 'new'
        },
        vendorService: {}
    };

    var mockDependenciesForEditVendor = {
        $location: {},
        $routeParams: {
            id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
        },
        vendorService: {
            load: function(){ 
                return {
                    name: 'Test Vendor'
                }; 
            }
        }
    };

    beforeEach(module('carli.sections.vendors.edit'));

    it('should have a default, editable Vendor on the New Vendor screen', inject(function($controller){
        var editCtrl = $controller('editVendorController', mockDependenciesForNewVendor);
        expect( editCtrl.vendor.name ).to.equal('New Vendor');
        expect( editCtrl.editable ).to.equal(true);
    }));

    it('should have a known, non-editable Vendor on the Edit Vendor screen', inject(function($controller){
        var editCtrl = $controller('editVendorController', mockDependenciesForEditVendor);
        expect( editCtrl.vendor.name ).to.equal('Test Vendor');
        expect( editCtrl.editable ).to.equal(false);
    }));

    it('should toggle the editable variable when calling toggleEditable()', inject(function($controller){
        var editCtrl = $controller('editVendorController', mockDependenciesForEditVendor);
        expect( editCtrl.editable ).to.equal(false);
        editCtrl.toggleEditable();
        expect( editCtrl.editable ).to.equal(true);
    }));

});
