angular.module('vendor.vendorCommentModal')
    .directive('vendorCommentModal', function(offeringService) {
        return {
            restrict: 'E',
            scope: {
                offering: '='
            },
            replace: false,
            templateUrl: '/vendorApp/components/vendorCommentModal/vendorCommentModal.html',
            link: vendorCommentModalPostLink
        };

        function vendorCommentModalPostLink(scope, element, attrs) {
            scope.saveOffering = saveOffering;

            function saveOffering(offering) {
                return offeringService.update(offering)
                    .then(offeringService.load)
                    .then(function (updatedOffering) {
                        offering._rev = updatedOffering._rev;
                        return updatedOffering;
                    });
            }
        }

    });
