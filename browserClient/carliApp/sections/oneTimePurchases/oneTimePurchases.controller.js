angular.module('carli.sections.oneTimePurchases')
.controller('oneTimePurchasesController', oneTimePurchasesController);

function oneTimePurchasesController( $sce, libraryService ){
    var vm = this;

    activate();

    function activate() {
        libraryService.list().then( function(libraryList){
            vm.libraryList = libraryList;
        });
    }
    
    vm.libraryListColumns = [
        {
            label: "Library",
            contentFunction: function(library) {
                return $sce.trustAsHtml('<a href="oneTimePurchases/' + library.id + '">' + library.name + '</a>');
            }
        },
        {
            label: "FTE",
            contentFunction: function(library) { return library.fte; }
        },
        {
            label: "Type",
            contentFunction: function(library) { return library.institutionType; }
        },
        {
            label: "",
            contentFunction: function(library) {
                return $sce.trustAsHtml('<a class="carli-button list-button" href="oneTimePurchases/' + library.id + '">View <i class="fa fa-chevron-circle-right"></i></a>');
            }
        }
    ];
}
