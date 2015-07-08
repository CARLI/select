angular.module('carli.app', [
    'busyClick',
    'ngAnimate',
    'ngRoute',
    'ngSanitize',
    'common.auth',
    'common.alerts',
    'common.config',
    'common.errorHandler',
    'common.fa',
    'common.modalDialog',
    'common.subscriptionHistoryTable',
    'common.warnIfUnsaved',
    'carli.admin',
    'carli.appState',
    'carli.carliHeader',
    'carli.cycleService',
    'carli.debugPanel',
    'carli.navBar',
    'carli.routes',
    'carli.userMenu',
    'common.vendorStatusService'
])
    .config(function ($locationProvider) {
        $locationProvider.html5Mode(true);
    })
    .run(function (authService, config) {
        if (authService.isRouteProtected()) {
            authService.redirectToLogin();
        }
    })
    .run(function ($rootScope, cycleService) {
        if ($rootScope.isLoggedIn) {
            cycleService.initCurrentCycle();
        }
    })
    .value('cgBusyDefaults', {
        //message:'Loading Stuff',
        //backdrop: false,
        templateUrl: '/carliApp/components/spinner/spinner.html'
        //delay: 300,
        //minDuration: 700,
        //wrapperClass: 'my-class my-class2'
    });
