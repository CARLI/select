angular.module('vendor.fakeVendorMenu')
    .directive('fakeVendorMenu', function ($q, $rootScope, currentUser, CarliModules) {
        return {
            restrict: 'E',
            templateUrl: '/vendorApp/components/fakeVendorMenu/fakeVendorMenu.html',
            link: function (scope) {
                var vendorModule = CarliModules.Vendor;

                activate();

                function activate() {
                    $q.when(vendorModule.list()).then(function (vendors) {
                        scope.vendorList = vendors;
                    });

                    scope.$watch('selectedVendor', function (newVendor) {
                        if (newVendor) {
                            $rootScope.currentUser.vendor = newVendor;
                            $rootScope.currentUser.userName = newVendor.name + ' User';
                        }
                    });
                }
            }
        };
    });
