angular.module('vendor.siteLicenseReactWrapper')
    .directive('siteLicenseReactWrapper', function(){
        return {
            restrict: 'E',
            scope: {},
            template: '<div id="react"></div>',
            controller: 'siteLicenseReactWrapperController',
            link: function($scope, elem, attrs, controller) {
                window.vendorSiteLicensePricingComponent.render(elem[0], controller);
            }
        };
    });