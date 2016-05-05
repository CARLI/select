angular.module('carli.sections.oneTimePurchases')
.controller('oneTimePurchasesController', oneTimePurchasesController);

function oneTimePurchasesController( $sce, notificationModalService, libraryService ){
    var vm = this;

    vm.groupBy = 'library';

    vm.invoiceAnnualAccessFees = invoiceAnnualAccessFees;

    vm.libraryListColumns = [
        {
            label: "Institution Name",
            orderByProperty: 'name',
            contentFunction: function(library) {
                return $sce.trustAsHtml('<a href="oneTimePurchases/' + library.id + '">' + library.name + '</a>');
            }
        },
        {
            label: "FTE",
            orderByProperty: 'fte',
            contentFunction: function(library) { return getFte(library); }
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
        vm.libraryLoadingPromise = libraryService.listActiveLibraries().then( function(libraryList){
            vm.libraryList = libraryList;
        });
    }

    function invoiceAnnualAccessFees() {
        notificationModalService.sendStartDraftMessage({
            templateId: 'notification-template-annual-access-fee-invoices'
        });
    }

    function getFte( library ){
        var result = library.fte;

        if ( library.fteInfo ){
            result += ' (' + library.fteInfo + ')';
        }
        return result;
    }
}
