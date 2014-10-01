angular.module('carli.routes',[
    'carli.sections.home',
    'carli.sections.section1',
    'carli.sections.section2',
    'carli.sections.section3',
    'carli.sections.style-guide'
])
.config(function ($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'carliApp/sections/home/home.html',
        controller: 'homeController'
    })
    .when('/section1', {
        templateUrl: 'carliApp/sections/section1/section1.html',
        controller: 'section1Controller'
    })
    .when('/section2', {
        templateUrl: 'carliApp/sections/section2/section2.html',
        controller: 'section2Controller'
    })
    .when('/section3', {
        templateUrl: 'carliApp/sections/section3/section3.html',
        controller: 'section1Controller'
    })
    .when('/style-guide', {
        templateUrl: 'carliApp/sections/style-guide/index.html',
        controller: 'styleGuideController'
    });
});
