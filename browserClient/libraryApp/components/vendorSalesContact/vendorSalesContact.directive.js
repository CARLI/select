angular.module('library.vendorSalesContact')
.directive('vendorSalesContact', function(){
    return {
        restrict: 'E',
        templateUrl: '/libraryApp/components/vendorSalesContact/vendorSalesContact.html',
        controller: vendorSalesContactController,
        controllerAs: 'vm',
        bindToController: true,
        scope: {
            vendor: '='
        }
    };
});