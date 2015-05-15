angular.module('library.app', [
    'busyClick',
    'cgBusy',
    'ngRoute',
    'ngAnimate',
    'common.accordion',
    'common.config',
    'common.fa',
    'common.warnIfUnsaved',
    'library.appState',
    'library.libraryHeader',
    'library.navBar',
    //'common.alerts',
    'library.routes',
    'library.userLookup',
    'library.userMenu',
    'library.fakeLibraryMenu'
])
.config(function($locationProvider){
    $locationProvider.html5Mode(true);
})
.run(function($rootScope) {
    $rootScope.appState = 'pendingUser';
})
.value('cgBusyDefaults',{
    //message:'Loading Stuff',
    //backdrop: false,
    templateUrl: '/carliApp/components/spinner/spinner.html'
    //delay: 300,
    //minDuration: 700,
    //wrapperClass: 'my-class my-class2'
});
