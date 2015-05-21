angular.module('library.app', [
    'busyClick',
    'cgBusy',
    'ngAnimate',
    'ngRoute',
    'common.alerts',
    'common.accordion',
    'common.config',
    'common.errorHandler',
    'common.fa',
    'common.offeringService',
    'common.productService',
    'common.warnIfUnsaved',
    'library.appState',
    'library.askCarliButton',
    'library.cycleChooser',
    'library.cycleService',
    'library.libraryHeader',
    'library.navBar',
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
