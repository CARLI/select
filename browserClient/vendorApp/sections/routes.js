angular.module('vendor.routes',[
        'vendor.sections.dashboard',
        'vendor.sections.siteLicensePrices'
    ])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/vendorApp/sections/dashboard/dashboard.html',
                controller:  'dashboardController',
                controllerAs:'vm'
            })
            .when('/dashboard', {
                templateUrl: '/vendorApp/sections/dashboard/dashboard.html',
                controller:  'dashboardController',
                controllerAs:'vm'
            })
            .when('/siteLicensePrices', {
                templateUrl: '/vendorApp/sections/siteLicensePrices/siteLicensePrices.html',
                controller:  'siteLicensePricesController',
                controllerAs:'vm'
            });
    });
