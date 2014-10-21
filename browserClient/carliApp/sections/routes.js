angular.module('carli.routes',[
    'carli.sections.dashboard',
    'carli.sections.subscriptions',
    'carli.sections.vendors',
    'carli.sections.products',
    'carli.sections.styleGuide'
])
.config(function ($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: '/carliApp/sections/dashboard/dashboard.html',
        controller:  'dashboardController',
        controllerAs:'dashboardController'
    })
    .when('/dashboard', {
        templateUrl: '/carliApp/sections/dashboard/dashboard.html',
        controller:  'dashboardController',
        controllerAs:'dashboardController'
    })
    .when('/subscription', {
        templateUrl: '/carliApp/sections/subscriptions/subscriptions.html',
        controller:  'subscriptionsController',
        controllerAs:'subscriptionsController' 
    })
    .when('/vendor', {
        templateUrl: '/carliApp/sections/vendors/vendors.html',
        controller:  'vendorsController',
        controllerAs:'vendorsController'
    })
    .when('/vendor/:id', {
        templateUrl: '/carliApp/sections/vendors/editVendor/editVendor.html',
        controller:  'editVendorController',
        controllerAs:'editVendorController'
    })
    .when('/product', {
        templateUrl: '/carliApp/sections/products/products.html',
        controller:  'productsController',
        controllerAs:'productsController'
    })
    .when('/product/:id', {
        templateUrl: '/carliApp/sections/products/editProduct/editProduct.html',
        controller:  'editProductController',
        controllerAs:'editProductController'
    })
    .when('/styleGuide', {
        templateUrl: '/carliApp/sections/styleGuide/styleGuide.html',
        controller:  'styleGuideController',
        controllerAs:'styleGuideController'
    });
});
