angular.module('vendor.addSuLevelButton')
    .directive('addSuLevelButton', function(uuid) {
        return {
            restrict: 'E',
            templateUrl: '/vendorApp/components/addSuLevelButton/addSuLevelButton.html',
            scope: {
                addSuPricingLevel: '='
            },
            controller: 'addSuLevelButtonController',
            controllerAs: 'vm',
            bindToController: true,
            link: function (scope, element, attrs) {
                scope.id = 'numberOfUsers' + uuid.generateCssId();
            }
        };
    });
