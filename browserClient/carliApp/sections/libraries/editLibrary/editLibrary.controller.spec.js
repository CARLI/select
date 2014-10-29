
describe('The Edit Library Controller', function(){

    var mockDependenciesForNewLibrary = {
        $location: {},
        $routeParams: {
            id: 'new'
        },
        libraryService: {}
    };

    var mockDependenciesForEditLibrary = {
        $location: {},
        $routeParams: {
            id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
        },
        libraryService: {
            load: function(){ 
                return {
                    name: 'Test Library',
                    "contacts": [
                        {
                            "contactType": "Billing",
                            "name": "Bob Martin",
                            "email": "bob@cleancode.org",
                            "phoneNumber": "123-555-1234"
                        }
                    ]
                }; 
            }
        }
    };

    beforeEach(module('carli.sections.libraries.edit'));

    it('should have a default, editable Library on the New Library screen', inject(function($controller){
        var editCtrl = $controller('editLibraryController', mockDependenciesForNewLibrary);
        expect( editCtrl.library.name ).to.equal('New Library');
        expect( editCtrl.editable ).to.equal(true);
    }));

    it('should have a known, non-editable Library on the Edit Library screen', inject(function($controller){
        var editCtrl = $controller('editLibraryController', mockDependenciesForEditLibrary);
        expect( editCtrl.library.name ).to.equal('Test Library');
        expect( editCtrl.editable ).to.equal(false);
    }));

    it('should toggle the editable variable when calling toggleEditable()', inject(function($controller){
        var editCtrl = $controller('editLibraryController', mockDependenciesForEditLibrary);
        expect( editCtrl.editable ).to.equal(false);
        editCtrl.toggleEditable();
        expect( editCtrl.editable ).to.equal(true);
    }));

    it('should be able to delete the first Billing contact', inject(function($controller) {
        var editCtrl = $controller('editLibraryController', mockDependenciesForEditLibrary);
        var contacts = editCtrl.library.contacts;
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
