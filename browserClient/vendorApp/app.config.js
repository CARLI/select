angular.module('vendor.app', [
    'busyClick',
    'ngRoute',
    'ngAnimate',
    'vendor.vendorHeader',
    //'common.fa',
    'vendor.navBar',
    //'common.alerts',
    'vendor.routes',
    'vendor.userMenu'
])
.config(function($locationProvider){
    $locationProvider.html5Mode(true);
})
//.run(function(cycleService){
//    cycleService.initCurrentCycle();
//})
.value('cgBusyDefaults',{
    //message:'Loading Stuff',
    //backdrop: false,
    templateUrl: '/carliApp/components/spinner/spinner.html'
    //delay: 300,
    //minDuration: 700,
    //wrapperClass: 'my-class my-class2'
});
