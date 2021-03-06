angular.module('library.routes',[
        'library.sections.dashboard',
        'library.sections.addSubscriptions',
        'library.sections.addOneTimePurchases',
        'library.sections.ipAddresses',
        'library.sections.notifications',
        'library.sections.login',
        'library.sections.report',
        'library.sections.resetRequest',
        'library.sections.masquerade',
        'library.sections.management',
        'library.sections.users.edit'
])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/dashboard', {
                templateUrl: '/libraryApp/sections/dashboard/dashboard.html',
                controller:  'dashboardController',
                controllerAs:'vm'
            })
            .when('/addSubscriptions', {
                templateUrl: '/libraryApp/sections/addSubscriptions/addSubscriptions.html',
                controller:  'addSubscriptionsController',
                controllerAs:'vm'
            })
            .when('/login', {
                templateUrl: '/libraryApp/sections/login/login.html',
                controller:  'loginPageController',
                controllerAs:'vm'
            })
            .when('/reset/:key', {
                templateUrl: '/libraryApp/sections/resetRequest/resetRequest.html',
                controller:  'resetRequestPageController',
                controllerAs:'vm'
            })
            .when('/addOneTimePurchases', {
                templateUrl: '/libraryApp/sections/addOneTimePurchases/addOneTimePurchases.html',
                controller:  'addOneTimePurchasesController',
                controllerAs:'vm'
            })
            .when('/report', {
                templateUrl: '/libraryApp/sections/report/report.html',
                controller:  'reportController',
                controllerAs:'vm'
            })
            .when('/masquerade', {
                templateUrl: '/libraryApp/sections/masquerade/masquerade.html',
                controller:  'masqueradeController',
                controllerAs:'vm'
            })
            .when('/notifications', {
                templateUrl: '/libraryApp/sections/notifications/notifications.html',
                controller: 'notificationsController',
                controllerAs: 'vm'
            })
            .when('/ipAddresses', {
                templateUrl: '/libraryApp/sections/ipAddresses/ipAddresses.html',
                controller:  'ipAddressesController',
                controllerAs:'vm'
            })
            .when('/management', {
                templateUrl: '/libraryApp/sections/management/management.html',
                controller:  'managementController',
                controllerAs:'vm'
            })
            .when('/user/:id', {
                templateUrl: '/libraryApp/sections/users/editUser/editUser.html',
                controller:  'editUserPageController',
                controllerAs:'vm'
            })
            .otherwise({
                redirectTo: '/login'
            })
        ;
    });
