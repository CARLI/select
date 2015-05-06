angular.module('carli.app', [
    'busyClick',
    'ngRoute',
    'carli.admin',
    'carli.cycleService',
    'common.fa',
    'ngAnimate',
    'carli.carliHeader',
    'carli.debugPanel',
    'carli.navBar',
    'carli.alerts',
    'carli.routes',
    'carli.userMenu'
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
