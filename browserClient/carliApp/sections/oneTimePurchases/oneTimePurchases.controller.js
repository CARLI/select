angular.module('carli.sections.oneTimePurchases')
.controller('oneTimePurchasesController', oneTimePurchasesController);

function oneTimePurchasesController( $sce, libraryService ){
    var vm = this;

    vm.libraryListColumns = [
        {
            label: "Library",
            orderByProperty: 'name',
            contentFunction: function(library) {
                return $sce.trustAsHtml('<a href="oneTimePurchases/' + library.id + '">' + library.name + '</a>');
            }
        },
        {
            label: "FTE",
            orderByProperty: 'fte',
            contentFunction: function(library) { return library.fte; }
        },
        {
            label: "Type",
            orderByProperty: 'institutionType',
            contentFunction: function(library) { return library.institutionType; }
        },
        {
            label: "",
            orderByProperty: false,
            contentFunction: function(library) {
                return $sce.trustAsHtml('<a class="carli-button list-button" href="oneTimePurchases/' + library.id + '">View <i class="fa fa-chevron-circle-right"></i></a>');
            }
        }
    ];

    activate();

    function activate() {
        vm.libraryLoadingPromise = libraryService.list().then( function(libraryList){
            vm.libraryList = libraryList;
        });
    }
}
