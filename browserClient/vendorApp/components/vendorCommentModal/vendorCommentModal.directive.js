angular.module('vendor.vendorCommentModal')
    .directive('vendorCommentModal', function() {
        return {
            restrict: 'E',
            replace: false,
            templateUrl: '/vendorApp/components/vendorCommentModal/vendorCommentModal.html'
        };
    });
