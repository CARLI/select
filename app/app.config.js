angular.module('carli.app', [
    'ngRoute',
    'carli.routes'
])
.config(function($locationProvider){
    $locationProvider.html5Mode(true);    
});
