angular.module('library.libraryProductsList')
.directive('libraryProductsList', function(){
    return {
        restrict: 'E',
        templateUrl: '/libraryApp/components/libraryProductsList/libraryProductsList.html',
        scope: {
            cycle: '='
        },
        controller: libraryProductsListController,
        controllerAs: 'vm',
        bindToController: true
    };
});