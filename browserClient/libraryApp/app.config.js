angular.module('library.app', [
    'busyClick',
    'cgBusy',
    'ngAnimate',
    'ngRoute',
    'ngSanitize',
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
    'library.fakeLibraryMenu'
])
.config(function($locationProvider){
    $locationProvider.html5Mode(true);
})
.run(function($rootScope, authService, config) {
    $rootScope.appState = 'pendingUser';

    if (authService.isRouteProtected()) {
        authService.redirectToLogin();
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
