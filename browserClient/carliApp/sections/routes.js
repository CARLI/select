angular.module('carli.routes',[
    'carli.sections.dashboard',
    'carli.sections.subscriptions',
    'carli.sections.vendors',
    'carli.sections.styleGuide'
])
.config(function ($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'carliApp/sections/dashboard/dashboard.html',
        controller:  'dashboardController',
        controllerAs:'dashboardController'
    })
    .when('/dashboard', {
        templateUrl: 'carliApp/sections/dashboard/dashboard.html',
        controller:  'dashboardController',
        controllerAs:'dashboardController'
    })
    .when('/subscriptions', {
        templateUrl: 'carliApp/sections/subscriptions/subscriptions.html',
        controller:  'subscriptionsController',
        controllerAs:'subscriptionsController' 
    })
    .when('/vendors', {
        templateUrl: '/carliApp/sections/vendors/vendors.html',
        controller:  'vendorsController',
        controllerAs:'vendorsController'
    })
    .when('/vendors/:id', {
        templateUrl: '/carliApp/sections/vendors/editVendor/editVendor.html',
        controller:  'editVendorController',
        controllerAs:'editVendorController'
    })
    .when('/styleGuide', {
        templateUrl: 'carliApp/sections/styleGuide/styleGuide.html',
        controller:  'styleGuideController',
        controllerAs:'styleGuideController'
    });
});
