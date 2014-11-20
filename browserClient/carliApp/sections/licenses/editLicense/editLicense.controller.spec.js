
describe('The Edit License Controller', function(){

    var newCtrl, editCtrl, mockDependenciesForNewLicense, mockDependenciesForEditLicense;

    beforeEach(function(){
        module('carli.sections.licenses.edit');
        module('carli.mockServices');

        inject(function($controller, $rootScope, $q, mockLocationService, mockLicenseService) {
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

            newCtrl  = $controller('editLicenseController', mockDependenciesForNewLicense);
            editCtrl = $controller('editLicenseController', mockDependenciesForEditLicense);
            $rootScope.$digest();
        });
    });

    it('should have a default, editable License on the New License screen', function(){
        expect( newCtrl.license.isActive ).to.equal(true);
        expect( newCtrl.editable ).to.equal(true);
        expect( newCtrl.newLicense ).to.equal(true);
    });

    it('should call licenseService.create when saving a new License', function(){
        expect( mockDependenciesForNewLicense.licenseService.createOrUpdate ).to.equal('neither');
        newCtrl.saveLicense();
        expect( mockDependenciesForNewLicense.licenseService.createOrUpdate ).to.equal('create');
    });

    it('should have a known, non-editable License on the Edit License screen', function(){
        expect( editCtrl.license.name ).to.equal('Test License');
        expect( editCtrl.editable ).to.equal(false);
        expect( editCtrl.newLicense ).to.equal(false);
    });

    it('should call licenseService.update when saving an existing License', function(){
        expect( mockDependenciesForEditLicense.licenseService.createOrUpdate ).to.equal('neither');
        editCtrl.saveLicense();
        expect( mockDependenciesForEditLicense.licenseService.createOrUpdate ).to.equal('update');
    });

    it('should toggle the editable variable when calling toggleEditable()', function(){
        expect( editCtrl.editable ).to.equal(false);
        editCtrl.toggleEditable();
        expect( editCtrl.editable ).to.equal(true);
    });

});

