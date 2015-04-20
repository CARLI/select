angular.module('vendor.app', [
    'busyClick',
    'cgBusy',
    'ngRoute',
    'ngAnimate',
    'common.accordion',
    'common.cycleService',
    'common.fa',
    'vendor.vendorHeader',
    'vendor.navBar',
    //'common.alerts',
    'vendor.routes',
    'vendor.userMenu',
    'vendor.fakeVendorMenu'
])
.config(function($locationProvider){
    $locationProvider.html5Mode(true);
})
.run(function($rootScope, $location, cycleService) {
    cycleService.initCurrentCycleForVendorApp()
        .then(openApp)
        .catch(closeApp);

    function openApp() {
        $rootScope.isAppOpen = true;
    }
    function closeApp() {
        $rootScope.isAppOpen = false;
        $location.path('/dashboard');
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
