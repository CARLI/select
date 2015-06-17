angular.module('library.routes',[
        'library.sections.dashboard',
        'library.sections.addSubscriptions',
        'library.sections.addOneTimePurchases'
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
            .when('/addOneTimePurchases', {
                templateUrl: '/libraryApp/sections/addOneTimePurchases/addOneTimePurchases.html',
                controller:  'addOneTimePurchasesController',
                controllerAs:'vm'
            })
            /*.when('/report', {
                templateUrl: '/libraryApp/sections/',
                controller:  'Controller',
                controllerAs:'vm'
            })
            .when('/notifications', {
                templateUrl: '/libraryApp/sections/',
                controller:  'Controller',
                controllerAs:'vm'
            })
            .when('/ipAddresses', {
                templateUrl: '/libraryApp/sections/',
                controller:  'Controller',
                controllerAs:'vm'
            })
            .when('/management', {
                templateUrl: '/libraryApp/sections/',
                controller:  'Controller',
                controllerAs:'vm'
            })
            */
            .otherwise({
                redirectTo: '/dashboard'
            })
        ;
    });
