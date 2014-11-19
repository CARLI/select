
describe('The Edit License Controller', function(){

    var mockDependenciesForNewLibrary, mockDependenciesForEditLibrary;

    beforeEach(function () {
        module('carli.sections.licenses.edit');
        module('carli.mockServices');

        inject(function ($q, mockLocationService, mockLicenseService) {
            mockDependenciesForNewLicense = {
                $location: mockLocationService,
                $routeParams: {
                    id: 'new'
                },
                licenseService: mockLicenseService
            };

            mockDependenciesForEditLicense = {
                $location: mockLocationService,
                $routeParams: {
                    id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
                },
                licenseService: mockLicenseService
            };
        });
    });

    it('should have a default, editable License on the New License screen', inject(function($controller){
        var editCtrl = $controller('editLicenseController', mockDependenciesForNewLicense);
        expect( editCtrl.license.isActive ).to.equal(true);
        expect( editCtrl.editable ).to.equal(true);
        expect( editCtrl.newLicense ).to.equal(true);
    }));

    it('should call licenseService.create when saving a new License', inject(function($controller, $rootScope){
        var editCtrl = $controller('editLicenseController', mockDependenciesForNewLicense);
        expect( mockDependenciesForNewLicense.licenseService.createOrUpdate ).to.equal('neither');
        editCtrl.saveLicense();
        $rootScope.$digest();
        expect( mockDependenciesForNewLicense.licenseService.createOrUpdate ).to.equal('create');
    }));

    it('should have a known, non-editable License on the Edit License screen', inject(function($controller, $rootScope){
        var editCtrl = $controller('editLicenseController', mockDependenciesForEditLicense);
        $rootScope.$digest();
        expect( editCtrl.license.name ).to.equal('Test License');
        expect( editCtrl.editable ).to.equal(false);
        expect( editCtrl.newLicense ).to.equal(false);
    }));

    it('should call licenseService.update when saving an existing License', inject(function($controller, $rootScope){
        var editCtrl = $controller('editLicenseController', mockDependenciesForEditLicense);
        expect( mockDependenciesForEditLicense.licenseService.createOrUpdate ).to.equal('neither');
        editCtrl.saveLicense();
        $rootScope.$digest();
        expect( mockDependenciesForEditLicense.licenseService.createOrUpdate ).to.equal('update');
    }));

    it('should toggle the editable variable when calling toggleEditable()', inject(function($controller){
        var editCtrl = $controller('editLicenseController', mockDependenciesForEditLicense);
        expect( editCtrl.editable ).to.equal(false);
        editCtrl.toggleEditable();
        expect( editCtrl.editable ).to.equal(true);
    }));

});

