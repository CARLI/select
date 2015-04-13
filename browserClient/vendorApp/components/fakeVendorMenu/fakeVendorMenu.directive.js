angular.module('vendor.fakeVendorMenu')
    .directive('fakeVendorMenu', function ($q, $rootScope, $window, currentUser, CarliModules) {
        return {
            restrict: 'E',
            templateUrl: '/vendorApp/components/fakeVendorMenu/fakeVendorMenu.html',
            link: function (scope) {
                var vendorModule = CarliModules.Vendor;

                activate();

                function activate() {
                    $q.when(vendorModule.list()).then(function (vendors) {
                        scope.vendorList = vendors;

                        if ($window.sessionStorage.getItem('currentVendorId')) {
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
                    var vendorId = $window.sessionStorage.getItem('currentVendorId');
                    var filteredVendors = scope.vendorList.filter(function (vendor) {
                        return vendor.id == vendorId;
                    });
                    setCurrentVendor(filteredVendors[0]);
                }

                function setCurrentVendor(vendor) {
                    $rootScope.currentUser.vendor = vendor;
                    $rootScope.currentUser.userName = vendor.name + ' User';

                    $window.sessionStorage.setItem('currentVendorId', vendor.id);
                }
            }
        };
    });
