angular.module('library.libraryHeader')
.directive('libraryHeader', function() {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: '/libraryApp/components/libraryHeader/libraryHeader.html'
    };
});
