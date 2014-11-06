angular.module('carli.app', [
    'ngRoute',
    'carli.carliHeader',
    'carli.navBar',
    'carli.alerts',
    'carli.routes',
    'picardy.fontawesome'
])
.config(function($locationProvider){
    $locationProvider.html5Mode(true);    
});
