angular.module('carli.app', [
    'ngRoute',
    'carli.cycleService',
    'carli.carliHeader',
    'carli.debugPanel',
    'carli.fa',
    'carli.navBar',
    'carli.alerts',
    'carli.routes'
])
.config(function($locationProvider){
    $locationProvider.html5Mode(true);
})
.run(function(cycleService){
    cycleService.initCurrentCycle();
});
