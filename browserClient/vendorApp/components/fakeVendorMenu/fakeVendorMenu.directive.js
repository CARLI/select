angular.module('vendor.fakeVendorMenu')
    .directive('fakeVendorMenu', function ($q, $window, userLookup, CarliModules) {
        return {
            restrict: 'E',
            templateUrl: '/vendorApp/components/fakeVendorMenu/fakeVendorMenu.html',
            link: function (scope) {
                var vendorModule = CarliModules.Vendor;

                activate();

                function activate() {
                    $q.when(vendorModule.list()).then(function (vendors) {
                        scope.vendorList = vendors;

                        if ($window.sessionStorage.getItem('authToken')) {
                            restoreCurrentVendor();
                        }
                    });

                    scope.$watch('selectedVendor', function (newVendor) {
                        if (newVendor) {
                            setCurrentVendor(newVendor);
                        }
                    });
                }

                function restoreCurrentVendor() {
                    var vendorId = JSON.parse($window.sessionStorage.getItem('authToken'))  .vendorId;
                    var filteredVendors = scope.vendorList.filter(function (vendor) {
                        return vendor.id == vendorId;
                    });
                    setCurrentVendor(filteredVendors[0]);
                }

                function setCurrentVendor(vendor) {
                    var authToken = {
                        userName: vendor.name + ' User',
                        vendorId: vendor.id
                    };
                    $window.sessionStorage.setItem('authToken', JSON.stringify(authToken));
                    userLookup.initializeUserFromToken(authToken);
                }
            }
        };
    });
