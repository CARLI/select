angular.module('library.licenseInfo')
    .directive('licenseInfo', function() {
        return {
            restrict: 'E',
            templateUrl: '/libraryApp/components/licenseInfo/licenseInfo.html',
            scope: {
                offering: '=',
                cycle: '='
            },
            controller: 'licenseInfoController',
            controllerAs: 'vm',
            bindToController: true
        };
    });
