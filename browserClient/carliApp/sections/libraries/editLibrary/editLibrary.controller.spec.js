
describe('The Edit Library Controller', function(){

    var mockLocation, mockLibraryService, mockDependenciesForNewLibrary, mockDependenciesForEditLibrary;

    beforeEach(module('carli.sections.libraries.edit'));
    beforeEach(inject( function($q) {
        mockLocation = {
            path: function(){}
        };

        mockLibraryService = {
            createOrUpdate: 'neither',
            create: function(){
                this.createOrUpdate = 'create';
                return { then: function() { } };
            },
            update: function(){
                this.createOrUpdate = 'update';
                return { then: function() { } };
            },
            load: function(){
                var deferred = $q.defer();
                deferred.resolve(
                    {
                        type: 'Library',
                        name: 'Test Library',
                        "contacts": [
                            {
                                "contactType": "Billing",
                                "name": "Bob Martin",
                                "email": "bob@cleancode.org",
                                "phoneNumber": "123-555-1234"
                            }
                        ]
                    }
                );
                return deferred.promise;
            },
            reset: function(){
                this.createOrUpdate = 'neither';
            },
            getInstitutionYearsOptions: function(){ return []; },
            getInstitutionTypeOptions: function(){ return []; },
            getMembershipLevelOptions: function(){ return []; }
        };

        mockDependenciesForNewLibrary = {
            $location: mockLocation,
            $routeParams: {
                id: 'new'
            },
            libraryService: mockLibraryService
        };

        mockDependenciesForEditLibrary = {
            $location: mockLocation,
            $routeParams: {
                id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
            },
            libraryService: mockLibraryService
        };
    } ));

    afterEach(function(){
        mockLibraryService.reset();
    });

    it('should export lists of options in the ViewModel', inject(function($controller){
        var editCtrl = $controller('editLibraryController', mockDependenciesForNewLibrary);
        expect( editCtrl.institutionYearsOptions ).to.be.an('Array');
        expect( editCtrl.institutionTypeOptions ).to.be.an('Array');
        expect( editCtrl.membershipLevelOptions ).to.be.an('Array');
    }));

    it('should have a default, editable library on the New Library screen', inject(function($controller){
        var editCtrl = $controller('editLibraryController', mockDependenciesForNewLibrary);
        expect( editCtrl.library.isActive ).to.equal(true);
        expect( editCtrl.editable ).to.equal(true);
        expect( editCtrl.newLibrary ).to.equal(true);
    }));

    it('should call libraryService.create when saving a new Library', inject(function($controller){
        var editCtrl = $controller('editLibraryController', mockDependenciesForNewLibrary);
        expect( mockDependenciesForNewLibrary.libraryService.createOrUpdate ).to.equal('neither');
        editCtrl.saveLibrary();
        expect( mockDependenciesForNewLibrary.libraryService.createOrUpdate ).to.equal('create');
    }));

    it('should have a known, non-editable library on the Edit library screen', inject(function($controller, $rootScope){
        var editCtrl = $controller('editLibraryController', mockDependenciesForEditLibrary);
        $rootScope.$digest();
        expect( editCtrl.library.name ).to.equal( 'Test Library');
        expect( editCtrl.editable ).to.equal(false);
        expect( editCtrl.newLibrary ).to.equal(false);
    }));

    it('should call libraryService.update when saving an existing library', inject(function($controller){
        var editCtrl = $controller('editLibraryController', mockDependenciesForEditLibrary);
        expect( mockDependenciesForEditLibrary.libraryService.createOrUpdate ).to.equal('neither');
        editCtrl.saveLibrary();
        expect( mockDependenciesForEditLibrary.libraryService.createOrUpdate ).to.equal('update');
    }));

    it('should toggle the editable variable when calling toggleEditable()', inject(function($controller){
        var editCtrl = $controller('editLibraryController', mockDependenciesForEditLibrary);
        expect( editCtrl.editable ).to.equal(false);
        editCtrl.toggleEditable();
        expect( editCtrl.editable ).to.equal(true);
    }));

    it('should be able to delete the first Billing contact', inject(function($controller, $rootScope) {
        var editCtrl = $controller('editLibraryController', mockDependenciesForEditLibrary);
        $rootScope.$digest();
        var contacts = editCtrl.library.contacts;
        var firstBillingContact = findFirstBillingContact(contacts);
        var initialLength = contacts.length;

        editCtrl.deleteContact(firstBillingContact);
        $rootScope.$digest();
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
