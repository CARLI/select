angular.module('vendor.vendorCommentsModal')
    .directive('vendorCommentsModal', function(offeringService) {
        return {
            restrict: 'E',
            scope: {
                offering: '='
            },
            replace: false,
            templateUrl: '/vendorApp/components/vendorCommentsModal/vendorCommentsModal.html',
            link: vendorCommentsModalPostLink
        };

        function vendorCommentsModalPostLink(scope, element, attrs) {
            scope.saveOffering = saveOffering;

            function saveOffering(offering) {
                return offeringService.update(offering)
                    .then(offeringService.load)
                    .then(updateRevision);

                function updateRevision(updatedOffering) {
                    offering._rev = updatedOffering._rev;
                    return updatedOffering;
                }
            }
        }

    });
