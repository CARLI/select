angular.module('vendor.routes',[
        'vendor.sections.dashboard',
        'vendor.sections.siteLicensePrices',
        'vendor.sections.simultaneousUserPrices',
        'vendor.sections.descriptions'
    ])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/dashboard', {
                templateUrl: '/vendorApp/sections/dashboard/dashboard.html',
                controller:  'dashboardController',
                controllerAs:'vm'
            })
            .when('/siteLicensePrices', {
                templateUrl: '/vendorApp/sections/siteLicensePrices/siteLicensePrices.html',
                controller:  'siteLicensePricesController',
                controllerAs:'vm'
            })
            .when('/simultaneousUserPrices', {
                templateUrl: '/vendorApp/sections/simultaneousUserPrices/simultaneousUserPrices.html',
                controller:  'simultaneousUserPricesController',
                controllerAs:'vm'
            })
            .when('/descriptions', {
                templateUrl: '/vendorApp/sections/descriptions/descriptions.html',
                controller:  'descriptionsController',
                controllerAs:'vm'
            })
            .otherwise({
                redirectTo: '/dashboard'
            })
    });
