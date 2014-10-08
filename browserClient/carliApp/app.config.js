angular.module('carli.app', [
    'ngRoute',
    'carli.routes',
    'picardy.fontawesome'
])
.config(function($locationProvider){
    $locationProvider.html5Mode(true);    
});
