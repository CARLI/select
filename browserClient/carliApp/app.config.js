angular.module('carli.app', [
    'busyClick',
    'ngAnimate',
    'ngRoute',
    'ngSanitize',
    'common.activityLogService',
    'common.auth',
    'common.alerts',
    'common.config',
    'common.errorHandler',
    'common.fa',
    'common.libraryStatusService',
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
    'common.warnIfUnsaved',
    'common.vendorStatusService'
])
    .config(function ($locationProvider) {
        $locationProvider.html5Mode(true);
    })
    .run(function (authService) {
        if (authService.isRouteProtected()) {
            authService.redirectToLogin();
        }
    })
    .run(function ($rootScope, cycleService) {
        if ($rootScope.isLoggedIn) {
            cycleService.initCurrentCycle();
        }
    })
    .run(function ($rootScope, config) {
        return config.loadConfigFromMiddleware()
            .then(() => $rootScope.configLoaded = true);
    })
    .value('cgBusyDefaults', {
        //message:'Loading Stuff',
        //backdrop: false,
        templateUrl: '/carliApp/components/spinner/spinner.html'
        //delay: 300,
        //minDuration: 700,
        //wrapperClass: 'my-class my-class2'
    });
