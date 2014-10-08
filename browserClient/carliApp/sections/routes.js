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
    .when('/subscriptions', {
        templateUrl: '/carliApp/sections/subscriptions/subscriptions.html',
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
    .when('/products', {
        templateUrl: '/carliApp/sections/products/products.html',
        controller:  'productsController',
        controllerAs:'productsController'
    })
    .when('/products/:id', {
        templateUrl: '/carliApp/sections/products/editProduct/editProduct.html',
        controller:  'editProductController',
        controllerAs:'editProductController'
    })
    .when('/styleGuide', {
        templateUrl: '/carliApp/sections/styleGuide/styleGuide.html',
        controller:  'styleGuideController',
        controllerAs:'vm'
    });
});
