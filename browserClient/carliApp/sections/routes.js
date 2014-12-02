angular.module('carli.routes',[
    'carli.sections.dashboard',
    'carli.sections.subscriptions',
    'carli.sections.oneTimePurchases',
    'carli.sections.vendors',
    'carli.sections.products',
    'carli.sections.libraries',
    'carli.sections.licenses',
    'carli.sections.styleGuide'
])
.config(function ($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: '/carliApp/sections/dashboard/dashboard.html',
        controller:  'dashboardController',
        controllerAs:'vm'
    })
    .when('/dashboard', {
        templateUrl: '/carliApp/sections/dashboard/dashboard.html',
        controller:  'dashboardController',
        controllerAs:'vm'
    })
    .when('/subscription', {
        templateUrl: '/carliApp/sections/subscriptions/subscriptions.html',
        controller:  'subscriptionsController',
        controllerAs:'vm'
    })
    .when('/oneTimePurchases', {
        templateUrl: '/carliApp/sections/oneTimePurchases/oneTimePurchases.html',
        controller:  'oneTimePurchasesController',
        controllerAs:'vm'
    })
    .when('/oneTimePurchases/:libraryId', {
        templateUrl: '/carliApp/sections/oneTimePurchases/selectedProducts/selectedProducts.html',
        controller:  'selectedProductsController',
        controllerAs:'vm'
    })
    .when('/vendor', {
        templateUrl: '/carliApp/sections/vendors/vendors.html',
        controller:  'vendorsController',
        controllerAs:'vm'
    })
    .when('/vendor/:id', {
        templateUrl: '/carliApp/sections/vendors/editVendor/editVendor.html',
        controller:  'editVendorPageController',
        controllerAs:'vm'
    })
    .when('/product', {
        templateUrl: '/carliApp/sections/products/products.html',
        controller:  'productsController',
        controllerAs:'vm'
    })
    .when('/product/:id', {
        templateUrl: '/carliApp/sections/products/editProduct/editProduct.html',
        controller:  'editProductController',
        controllerAs:'vm'
    })
    .when('/library', {
        templateUrl: '/carliApp/sections/libraries/libraries.html',
        controller:  'librariesController',
        controllerAs:'vm'
    })
    .when('/library/:id', {
        templateUrl: '/carliApp/sections/libraries/editLibrary/editLibrary.html',
        controller:  'editLibraryController',
        controllerAs:'vm'
    })
    .when('/license', {
        templateUrl: '/carliApp/sections/licenses/licenses.html',
        controller:  'licensesController',
        controllerAs:'vm'
    })
    .when('/license/:id', {
        templateUrl: '/carliApp/sections/licenses/editLicense/editLicense.html',
        controller:  'editLicensePageController',
        controllerAs:'vm'
    })
    .when('/styleGuide', {
        templateUrl: '/carliApp/sections/styleGuide/styleGuide.html',
        controller:  'styleGuideController',
        controllerAs:'vm'
    });
});
