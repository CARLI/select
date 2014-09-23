angular.module('carli.routes',[
    'carli.sections.home',
    'carli.sections.section1',
    'carli.sections.section2',
    'carli.sections.section3'
])
.config(function ($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'app/sections/home/home.html',
        controller: 'homeController'
    })
    .when('/section1', {
        templateUrl: 'app/sections/section1/section1.html',
        controller: 'section1Controller'
    })
    .when('/section2', {
        templateUrl: 'app/sections/section2/section2.html',
        controller: 'section2Controller'
    })
    .when('/section3', {
        templateUrl: 'app/sections/section3/section3.html',
        controller: 'section1Controller'
    });
});
