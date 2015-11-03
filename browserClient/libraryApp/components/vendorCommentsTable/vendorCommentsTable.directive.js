angular.module('library.vendorCommentsTable')
.directive('vendorCommentsTable', function(){
    return {
        restrict: 'E',
        templateUrl: '/libraryApp/components/vendorCommentsTable/vendorCommentsTable.html',
        controller: vendorCommentsTableController,
        controllerAs: 'vm',
        bindToController: true,
        scope: {
            offering: '='
        }
    };
});