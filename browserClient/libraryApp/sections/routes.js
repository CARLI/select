angular.module('library.routes',[
        'library.sections.dashboard'
    ])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/libraryApp/sections/dashboard/dashboard.html',
                controller:  'dashboardController',
                controllerAs:'vm'
            })
            .when('/dashboard', {
                templateUrl: '/libraryApp/sections/dashboard/dashboard.html',
                controller:  'dashboardController',
                controllerAs:'vm'
            })
//            .when('/addSubscriptions', {
//                templateUrl: '/libraryApp/sections/',
//                controller:  'Controller',
//                controllerAs:'vm'
//            })
            .when('/addOneTimePurchases', {
                templateUrl: '/libraryApp/sections/addOneTimePurchases/addOneTimePurchases.html',
                controller:  'addOneTimePurchasesController',
                controllerAs:'vm'
            })
            .when('/addOneTimePurchases/review', {
                templateUrl: '/libraryApp/sections/addOneTimePurchases/review/addOneTimePurchasesReview.html',
                controller:  'addOneTimePurchasesReviewController',
                controllerAs:'vm'
            })
            .when('/addOneTimePurchases/complete', {
                templateUrl: '/libraryApp/sections/addOneTimePurchases/complete/addOneTimePurchasesComplete.html',
                controller:  'addOneTimePurchasesCompleteController',
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
        ;
    });
