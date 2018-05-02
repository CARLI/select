angular.module('vendor.routes',[
        'vendor.sections.dashboard',
        'vendor.sections.siteLicensePrices',
        'vendor.sections.simultaneousUserPrices',
        'vendor.sections.descriptions',
        'vendor.sections.login',
        'vendor.sections.resetRequest',
        'vendor.sections.masquerade'
])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/dashboard', {
                templateUrl: '/vendorApp/sections/dashboard/dashboard.html',
                controller:  'dashboardController',
                controllerAs:'vm'
            })
            .when('/login', {
                templateUrl: '/vendorApp/sections/login/login.html',
                controller:  'loginPageController',
                controllerAs:'vm'
            })
            .when('/reset/:key', {
                templateUrl: '/vendorApp/sections/resetRequest/resetRequest.html',
                controller:  'resetRequestPageController',
                controllerAs:'vm'
            })
            .when('/siteLicensePrices', {
                templateUrl: '/vendorApp/sections/siteLicensePrices/siteLicensePrices.html',
                controller:  'siteLicensePricesController',
                controllerAs:'vm'
            })
            .when('/react', { //intended to replace /siteLicensePrices
                templateUrl: '/vendorApp/sections/siteLicensePricesReact/siteLicensePricesReact.html',
                controller:  'siteLicensePricesReactController',
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
            .when('/masquerade', {
                templateUrl: '/vendorApp/sections/masquerade/masquerade.html',
                controller:  'masqueradeController',
                controllerAs:'vm'
            })
            .otherwise({
                redirectTo: '/login'
            });
    });
