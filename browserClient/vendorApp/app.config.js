angular.module('vendor.app', [
    'busyClick',
    'cgBusy',
    'ngRoute',
    'ngAnimate',
    'common.accordion',
    'common.config',
    'common.fa',
    'common.warnIfUnsaved',
    'vendor.appState',
    'vendor.vendorHeader',
    'vendor.navBar',
    //'common.alerts',
    'vendor.routes',
    'vendor.cycleChooser',
    'vendor.cycleService',
    'vendor.userLookup',
    'vendor.userMenu',
    'vendor.fakeVendorMenu'
])
.config(function($locationProvider){
    $locationProvider.html5Mode(true);
})
.run(function($rootScope) {
    $rootScope.appState = 'pendingUser';
})
.value('cgBusyDefaults',{
    //message:'Loading Stuff',
    //backdrop: false,
    templateUrl: '/carliApp/components/spinner/spinner.html'
    //delay: 300,
    //minDuration: 700,
    //wrapperClass: 'my-class my-class2'
});
