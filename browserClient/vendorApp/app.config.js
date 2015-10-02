angular.module('vendor.app', [
    'busyClick',
    'cgBusy',
    'ngAnimate',
    'ngRoute',
    'common.activityLogService',
    'common.auth',
    'common.accordion',
    'common.alerts',
    'common.askCarliButton',
    'common.askCarliForm',
    'common.config',
    'common.errorHandler',
    'common.fa',
    'common.vendorStatusService',
    'common.warnIfUnsaved',
    'vendor.appState',
    'vendor.vendorHeader',
    'vendor.navBar',
    'vendor.routes',
    'vendor.cycleChooser',
    'vendor.cycleService',
    'vendor.userLookup',
    'vendor.userMenu',
    'vendor.vendorDataService'
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
