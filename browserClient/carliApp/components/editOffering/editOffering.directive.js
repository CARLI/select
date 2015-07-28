angular.module('carli.editOffering')
    .directive('editOffering', function (alertService, cycleService, errorHandler, offeringService) {
        return {
            restrict: 'E',
            scope: {
                cycle: '=',
                offering: '=',
                columns: '=',
                notifyParentOfSave: '=onOfferingSaved'
            },
            link: editOfferingPostLink,
            controller: editOfferingController,
            controllerAs: 'vm',
            bindToController: true,
            templateUrl: '/carliApp/components/editOffering/editOffering.html'
        };

        function editOfferingPostLink(scope, element, attrs) {

        }

        function editOfferingController(productService) {
            var vm = this;
            vm.saveOffering = saveOffering;
            vm.shouldShowColumn = shouldShowColumn;
            vm.offeringDisplayOptions = offeringService.getOfferingDisplayOptions();
            vm.userClickedFlag = userClickedFlag;
            vm.getProductDisplayName = productService.getProductDisplayName;

            var userTouchedFlag = false;

            activate();


            function activate(){
                offeringService.load(vm.offering.id)
                    .then(workaroundCouchStoreRevisionSmell);
            }

            function saveOffering() {
                var tempLibraryComments = "";
                if (vm.offering.libraryComments === vm.offering.product.comments) {
                    tempLibraryComments = vm.offering.product.comments;
                    delete vm.offering.libraryComments;
                }
                if (!userTouchedFlag) {
                    delete vm.offering.flagged;
                }
                userTouchedFlag = false;

                keepValidSuPricingRows();

                return offeringService.update(vm.offering)
                    .then(offeringService.load)
                    .then(updateOfferingFlaggedStatus)
                    .then(function(updatedOffering){
                        workaroundCouchStoreRevisionSmell(updatedOffering);
                        alertService.putAlert('Offering updated', {severity: 'success'});
                        vm.notifyParentOfSave(vm.offering);
                    })
                    .then(syncData)
                    .then(replaceLibraryCommentsIfRemoved(tempLibraryComments))
                    .catch(errorHandler);

                function replaceLibraryCommentsIfRemoved(comments) {
                    if (comments === vm.offering.product.comments) {
                        vm.offering.libraryComments = comments;
                    }
                }

                function updateOfferingFlaggedStatus( offering ){
                    offering.flagged = offeringService.getFlaggedState(offering);
                    return offering;
                }

                function syncData(){
                    return cycleService.syncDataToVendorDatabase(vm.offering.vendorId);
                }

                function keepValidSuPricingRows(){
                    var newSuPricing = [];

                    for ( var i in vm.offering.pricing.su ){
                        var pricingRow = vm.offering.pricing.su[i];
                        if ( pricingRow.price && pricingRow.users ){
                            newSuPricing.push( vm.offering.pricing.su[i] );
                        }
                    }

                    vm.offering.pricing.su = newSuPricing;
                }
            }

            function workaroundCouchStoreRevisionSmell( offering ){
                vm.offering._rev = offering._rev;
            }

            function shouldShowColumn(columnName) {
                return vm.columns.indexOf(columnName) !== -1;
            }

            function userClickedFlag() {
                userTouchedFlag = true;
            }
        }
    });
