angular.module('library.app', [
    'busyClick',
    'cgBusy',
    'ngAnimate',
    'ngRoute',
    'ngSanitize',
    'common.activityLogService',
    'common.auth',
    'common.alerts',
    'common.accordion',
    'common.config',
    'common.controllerBaseService',
    'common.errorHandler',
    'common.fa',
    'common.libraryStatusService',
    'common.offeringService',
    'common.productService',
    'common.scrollTo',
    'common.warnIfUnsaved',
    'common.askCarliButton',
    'common.askCarliForm',
    'library.appState',
    'library.cycleService',
    'library.libraryHeader',
    'library.navBar',
    'library.routes',
    'library.userLookup',
    'library.userMenu',
    'library.fakeLibraryMenu',
    'library.vendorCommentsTable',
    'library.vendorSalesContact'
])
.config(function($locationProvider){
    $locationProvider.html5Mode(true);
})
.run(function($rootScope, authService, config) {
    $rootScope.appState = 'pendingUser';

    if (authService.isMasqueradingRequested()) {
        authService.initializeMasquerading()
            .then(handleAuthentication)
            .catch(handleUnauthorizedMasqueradeAttempt);
    } else {
        handleAuthentication();
    }

    function handleAuthentication() {
        if (authService.isRouteProtected()) {
            return authService.redirectToLogin();
        }
    }

    function handleUnauthorizedMasqueradeAttempt() {
        authService.deleteSession().then(authService.redirectToLogin);
    }
})
.value('cgBusyDefaults',{
    //message:'Loading Stuff',
    //backdrop: false,
    templateUrl: '/carliApp/components/spinner/spinner.html'
    //delay: 300,
    //minDuration: 700,
    //wrapperClass: 'my-class my-class2'
});
