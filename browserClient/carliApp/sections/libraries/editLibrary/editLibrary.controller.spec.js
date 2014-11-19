
describe('The Edit Library Controller', function(){

    var mockDependenciesForNewLibrary, mockDependenciesForEditLibrary;

    beforeEach(function(){
        module('carli.sections.libraries.edit');
        module('carli.mockServices');

        inject( function($q, mockLocationService, mockLibraryService ) {
            mockDependenciesForNewLibrary = {
                $location: mockLocationService,
                $routeParams: {
                    id: 'new'
                },
                libraryService: mockLibraryService
            };

            mockDependenciesForEditLibrary = {
                $location: mockLocationService,
                $routeParams: {
                    id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
                },
                libraryService: mockLibraryService
            };
        });
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

    it('should be able to delete the first Director contact', inject(function($controller, $rootScope) {
        var editCtrl = $controller('editLibraryController', mockDependenciesForEditLibrary);
        $rootScope.$digest();
        var contacts = editCtrl.library.contacts;
        var firstDirectorContact = findFirstDirectorContact(contacts);
        var initialLength = contacts.length;

        editCtrl.deleteContact(firstDirectorContact);
        $rootScope.$digest();
        expect( contacts.length ).to.equal(initialLength - 1);
    }));

});

function findFirstDirectorContact(contacts) {
    var firstDirectorContact = null;
    for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].contactType === 'Director') {
            firstDirectorContact = contacts[i];
            break;
        }
    }
    return firstDirectorContact;
}
