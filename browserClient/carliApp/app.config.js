angular.module('carli.app', [
    'busyClick',
    'ngAnimate',
    'ngRoute',
    'ngSanitize',
    'common.alerts',
    'common.errorHandler',
    'common.fa',
    'common.warnIfUnsaved',
    'carli.admin',
    'carli.carliHeader',
    'carli.cycleService',
    'carli.debugPanel',
    'carli.navBar',
    'carli.routes',
    'carli.userMenu',
    'common.vendorStatusService'
])
.config(function($locationProvider){
    $locationProvider.html5Mode(true);
})
.run(function(cycleService){
    cycleService.initCurrentCycle();
})
.value('cgBusyDefaults',{
    //message:'Loading Stuff',
    //backdrop: false,
    templateUrl: '/carliApp/components/spinner/spinner.html'
    //delay: 300,
    //minDuration: 700,
    //wrapperClass: 'my-class my-class2'
});
