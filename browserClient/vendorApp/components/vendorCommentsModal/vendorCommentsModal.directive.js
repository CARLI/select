angular.module('vendor.vendorCommentsModal')
    .directive('vendorCommentsModal', function(offeringService) {
        return {
            restrict: 'E',
            scope: {
                commentText: '=',
                onModalOk: '='
            },
            replace: false,
            templateUrl: '/vendorApp/components/vendorCommentsModal/vendorCommentsModal.html'
        };
    });
