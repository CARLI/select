angular.module('carli.editOffering')
    .directive('editOffering', function (alertService, offeringService) {
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

        function editOfferingController() {
            var vm = this;
            vm.saveOffering = saveOffering;
            vm.shouldShowColumn = shouldShowColumn;
            vm.offeringDisplayOptions = offeringService.getOfferingDisplayOptions();

            function saveOffering() {
                if (vm.offering.libraryComments === vm.offering.product.comments) {
                    delete vm.offering.libraryComments;
                }
                if (!vm.offering.userTouchedFlag) {
                    delete vm.offering.flagged;
                }
                delete vm.offering.userTouchedFlag;

                offeringService.update(vm.offering)
                    .then(offeringService.load)
                    .then(updateOfferingFlaggedStatus)
                    .then(function(updatedOffering){
                        workaroundCouchStoreRevisionSmell(updatedOffering);
                        alertService.putAlert('Offering updated', {severity: 'success'});
                        vm.notifyParentOfSave(vm.offering);
                    }).catch(function(err) {
                        alertService.putAlert(err, {severity: 'danger'});
                        console.log('failed', err);
                    });

                function updateOfferingFlaggedStatus( offering ){
                    offering.flagged = offering.getFlaggedState();
                    return offering;
                }

                function workaroundCouchStoreRevisionSmell( offering ){
                    vm.offering._rev = offering._rev;
                }
            }

            function shouldShowColumn(columnName) {
                return vm.columns.indexOf(columnName) !== -1;
            }
        }
    });
