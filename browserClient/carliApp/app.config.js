angular.module('carli.app', [
    'busyClick',
    'ngAnimate',
    'ngRoute',
    'ngSanitize',
    'common.auth',
    'common.alerts',
    'common.errorHandler',
    'common.fa',
    'common.modalDialog',
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
.run(function(authService) {
    authService.requireSession()
        .then(authService.requireStaff)
        .then(authService.getCurrentUser)
        .then(authService.requireActive)
        .catch(authService.deleteSession);
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
