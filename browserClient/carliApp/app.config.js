angular.module('carli.app', [
    'ngRoute',
    'carli.navBar',
    'carli.routes',
    'picardy.fontawesome'
])
.config(function($locationProvider){
    $locationProvider.html5Mode(true);    
});
