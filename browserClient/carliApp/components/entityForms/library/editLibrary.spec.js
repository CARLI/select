
describe('The Edit Library Directive', function(){

    var newCtrl, editCtrl, mockDependenciesForNewLibrary, mockDependenciesForEditLibrary;

    beforeEach(function(){
        module('carli.entityForms.library');
        module('carli.mockServices');

        inject( function($controller, $rootScope, $q, mockLocationService, mockLibraryService, mockAlertService ) {
            mockDependenciesForNewLibrary = {
                $scope: {},
                libraryService: mockLibraryService,
                alertService: mockAlertService
            };

            mockDependenciesForEditLibrary = {
                $scope: {
                    libraryId: 'xxxxx'
                },
                libraryService: mockLibraryService,
                alertService: mockAlertService
            };

            newCtrl  = $controller('editLibraryController', mockDependenciesForNewLibrary);
            editCtrl = $controller('editLibraryController', mockDependenciesForEditLibrary);
            $rootScope.$digest();
        });
    });

    it('should export lists of options in the ViewModel', function(){
        expect( newCtrl.institutionYearsOptions ).to.be.an('Array');
        expect( newCtrl.institutionTypeOptions ).to.be.an('Array');
        expect( newCtrl.membershipLevelOptions ).to.be.an('Array');
    });

    it('should have a default, editable library on the New Library screen', function(){
        expect( newCtrl.library.isActive ).to.equal(true);
        expect( newCtrl.editable ).to.equal(true);
        expect( newCtrl.newLibrary ).to.equal(true);
    });

    it('should call libraryService.create when saving a new Library', function(){
        expect( mockDependenciesForNewLibrary.libraryService.createOrUpdate ).to.equal('neither');
        newCtrl.saveLibrary();
        expect( mockDependenciesForNewLibrary.libraryService.createOrUpdate ).to.equal('create');
    });

    it('should add an alert when saving a new Library', inject(function($rootScope){
        expect( mockDependenciesForNewLibrary.alertService.alertCount ).to.equal( 0 );
        newCtrl.saveLibrary();
        $rootScope.$digest();
        expect( mockDependenciesForNewLibrary.alertService.alertCount ).to.equal( 1 );
    }));

    it('should have a known, non-editable library on the Edit Library screen', function(){
        expect( editCtrl.library.name ).to.equal( 'Test Library');
        expect( editCtrl.editable ).to.equal(false);
        expect( editCtrl.newLibrary ).to.equal(false);
    });

    it('should call libraryService.update when saving an existing Library', function(){
        expect( mockDependenciesForEditLibrary.libraryService.createOrUpdate ).to.equal('neither');
        editCtrl.saveLibrary();
        expect( mockDependenciesForEditLibrary.libraryService.createOrUpdate ).to.equal('update');
    });

    it('should add an alert when saving an existing Library', inject(function($rootScope){
        expect( mockDependenciesForEditLibrary.alertService.alertCount ).to.equal( 0 );
        editCtrl.saveLibrary();
        $rootScope.$digest();
        expect( mockDependenciesForEditLibrary.alertService.alertCount ).to.equal( 1 );
    }));

    it('should toggle the editable variable when calling toggleEditable()', function(){
        expect( editCtrl.editable ).to.equal(false);
        editCtrl.toggleEditable();
        expect( editCtrl.editable ).to.equal(true);
    });

    it('should be able to delete the first Director contact', function() {
        var contacts = editCtrl.library.contacts;
        var firstDirectorContact = findFirstDirectorContact(contacts);
        var initialLength = contacts.length;

        editCtrl.deleteContact(firstDirectorContact);
        expect( contacts.length ).to.equal(initialLength - 1);
    });

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
