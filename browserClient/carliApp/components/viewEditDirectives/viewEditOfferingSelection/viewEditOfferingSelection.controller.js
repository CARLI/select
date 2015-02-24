angular.module('carli.viewEditDirectives.viewEditOfferingSelection')
    .controller('viewEditOfferingSelectionController', viewEditOfferingSelectionController);

function viewEditOfferingSelectionController(){
    var vm = this;

    vm.selectionOptions = makeSelectionOptions( vm.offering );


    function makeSelectionOptions( offering ){
        var result = {};
        if ( !offering ){
            return result;
        }

        var siteOption = {
            users: 'Site License',
            price: offering.pricing.site
        };

        return offering.pricing.su.concat(siteOption);
    }
}

