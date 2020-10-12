angular.module('carli.routes',[
    'carli.sections.dashboard',
    'carli.sections.cycleCreationDashboard',
    'carli.sections.subscriptions',
    'carli.sections.oneTimePurchases',
    'carli.sections.vendors',
    'carli.sections.notifications',
    'carli.sections.products',
    'carli.sections.libraries',
    'carli.sections.licenses',
    'carli.sections.membership',
    'carli.sections.reports',
    'carli.sections.revisionHistory',
    'carli.sections.deleteCycles',
    'carli.sections.styleGuide',
    'carli.sections.login',
    'carli.sections.resetRequest',
    'carli.sections.users'
])
.config(function ($routeProvider) {
    $routeProvider
    .when('/admin/databaseStatus', {
        templateUrl: '/carliApp/sections/admin/databaseStatus/databaseStatus.html',
        controller:  'databaseStatusController',
        controllerAs:'vm'
    })
    .when('/login', {
        templateUrl: '/carliApp/sections/login/login.html',
        controller:  'loginPageController',
        controllerAs:'vm'
    })
    .when('/reset/:key', {
        templateUrl: '/carliApp/sections/resetRequest/resetRequest.html',
        controller:  'resetRequestPageController',
        controllerAs:'vm'
    })
    .when('/user', {
        redirectTo: '/user/staff'
    })
    .when('/user/staff', {
        templateUrl: '/carliApp/sections/users/users.html',
        controller:  'userController',
        controllerAs:'vm'
    })
    .when('/user/vendor', {
        templateUrl: '/carliApp/sections/users/users.html',
        controller:  'userController',
        controllerAs:'vm'
    })
    .when('/user/library', {
        templateUrl: '/carliApp/sections/users/users.html',
        controller:  'userController',
        controllerAs:'vm'
    })
    .when('/user/:id', {
        templateUrl: '/carliApp/sections/users/editUser/editUser.html',
        controller:  'editUserPageController',
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
    .when('/cycleCreationDashboard', {
        templateUrl: '/carliApp/sections/cycleCreationDashboard/cycleCreationDashboard.html',
        controller:  'cycleCreationDashboardController',
        controllerAs:'vm'
    })
    .when('/subscription/:id', {
        templateUrl: '/carliApp/sections/subscriptions/editCycle/editCycle.html',
        controller:  'editCycleController',
        controllerAs:'cycleRouter'
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
    .when('/product/:cycleId', {
        templateUrl: '/carliApp/sections/products/products.html',
        controller:  'productsController',
        controllerAs:'vm'
    })
    .when('/product/:cycleId/:productId', {
        templateUrl: '/carliApp/sections/products/editProduct/editProduct.html',
        controller:  'editProductPageController',
        controllerAs:'vm'
    })
    .when('/library', {
        templateUrl: '/carliApp/sections/libraries/libraries.html',
        controller:  'librariesController',
        controllerAs:'vm'
    })
    .when('/library/:id', {
        templateUrl: '/carliApp/sections/libraries/editLibrary/editLibrary.html',
        controller:  'editLibraryPageController',
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
    .when('/membership', {
        templateUrl: '/carliApp/sections/membership/membership.html',
        controller:  'membershipController',
        controllerAs:'vm'
    })
    .when('/membership/:year', {
        templateUrl: '/carliApp/sections/membership/membership.html',
        controller:  'membershipController',
        controllerAs:'vm'
    })
    .when('/reports', {
        templateUrl: '/carliApp/sections/reports/reports.html',
        controller:  'reportsController',
        controllerAs:'vm'
    })
    .when('/notifications', {
        templateUrl: '/carliApp/sections/notifications/notifications.html',
        controller:  'notificationsController',
        controllerAs:'vm'
    })
    .when('/revisionHistory', {
        templateUrl: '/carliApp/sections/revisionHistory/revisionHistory.html',
        controller:  'revisionHistoryController',
        controllerAs:'vm'
    })
    .when('/deleteCycles', {
        templateUrl: '/carliApp/sections/deleteCycles/deleteCycles.html',
        controller: 'deleteCyclesController',
        controllerAs:'vm'
    })
    .when('/styleGuide', {
        templateUrl: '/carliApp/sections/styleGuide/styleGuide.html',
        controller:  'styleGuideController',
        controllerAs:'vm'
    })
    .otherwise({
        redirectTo: '/login'
    });
});
