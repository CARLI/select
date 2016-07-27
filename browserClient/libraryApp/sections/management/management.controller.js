angular.module('library.sections.management')
    .controller('managementController', managementController);

function managementController(cycleService, libraryService, userService) {
    var vm = this;

    var currentUser = userService.getUser();
    var currentLibrary = currentUser.library;

    vm.library = null;
    vm.loadingPromise = null;
    vm.currentFiscalYear = null;

    vm.userList = null;
    vm.userLoadingPromise = null;
    vm.userListColumns = null;

    vm.readOnlyUserList = null;
    vm.readOnlyUserLoadingPromise = null;
    vm.readOnlyUserListColumns = null;

    vm.userListColumns = [
        {
            label: "User",
            orderByProperty: 'fullName',
            contentFunction: function(user) {
                // return $sce.trustAsHtml('<a href="user/' + user.email + '">' + user.fullName + '</a>');
                return user.fullName;
            }
        },
        {
            label: "Email",
            orderByProperty: ['email'],
            contentFunction: function(user) {
                return $sce.trustAsHtml('<a href="mailto:' + user.email + '">' + user.email + '</a>');
            }
        }
    ];

    activate();

    function activate() {
        initVmLibrary();
        initCurrentYear();
        initUserLists();
    }

    function initVmLibrary() {
        vm.loadingPromise = libraryService.load(currentLibrary.id)
            .then(function (library) {
                vm.library = library;
            });
        return vm.loadingPromise;
    }

    function initCurrentYear() {
        vm.currentFiscalYear = currentFiscalYear();
    }

    function currentFiscalYear() {
        if ( cycleService.fiscalYearHasStartedForDate(new Date())) {
            return currentCalendarYear() + 1;
        } else {
            return currentCalendarYear();
        }
    }

    function currentCalendarYear(){
        return parseInt( new Date().getFullYear() );
    }

    function initUserLists() {
        userService.list()
            .then(filterUserList)
            .then(setVmUserLists);

        function filterUserList(users) {
            return users.filter(function (u) {
                return u.isActive && userBelongsToThisLibrary(u) && userIsNotStaff(u);
            });
        }

        function userBelongsToThisLibrary(u) {
            return u.hasOwnProperty('library') && u.library == currentLibrary.id;
        }

        function userIsNotStaff(u) {
            return u.roles.indexOf('staff') == -1;
        }

        function setVmUserLists(users) {
            vm.userList = users.filter(adminUsersForThisLibrary);
            vm.readOnlyUserList = users.filter(readOnlyUsersForThisLibrary);

            function adminUsersForThisLibrary(u) {
                return u.roles.indexOf('readonly') == -1;
            }

            function readOnlyUsersForThisLibrary(u) {
                return u.roles.indexOf('readonly') != -1;
            }
        }
    }
}
