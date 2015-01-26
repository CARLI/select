angular.module('carli.app', [
    'ngRoute',
    'carli.carliHeader',
    'carli.debugPanel',
    'carli.fa',
    'carli.navBar',
    'carli.alerts',
    'carli.routes'
])
.config(function($locationProvider){
    $locationProvider.html5Mode(true);    
});
