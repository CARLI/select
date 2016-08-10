angular.module('library.sections.management')
    .controller('managementController', managementController);

function managementController($sce, cycleService, libraryService, userService, membershipService) {
    var vm = this;

    var currentUser = userService.getUser();
    var currentLibrary = currentUser.library;

    vm.library = null;
    vm.loadingPromise = null;
    vm.userLoadingPromise = null;
    vm.currentFiscalYear = null;
    vm.membershipFees = null;

    vm.afterUserSubmit = populateUserLists;

    vm.userList = null;
    vm.userListColumns = [
        {
            label: "User",
            orderByProperty: 'fullName',
            contentFunction: function(user) {
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

    vm.readOnlyUserList = null;
    vm.readOnlyUserLoadingPromise = null;
    vm.readOnlyUserListColumns = [
        {
            label: "User",
            orderByProperty: 'fullName',
            contentFunction: function(user) {
                return $sce.trustAsHtml('<a href="user/' + user.email + '">' + user.fullName + '</a>');
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

    vm.inactiveUserList = null;
    vm.inactiveUserLoadingPromise = null;
    vm.inactiveUserListColumns = vm.readOnlyUserListColumns;

    activate();

    function activate() {
        initCurrentYear();
        initVmLibrary()
            .then(function () {
                initMembershipFees();
                vm.userLoadingPromise = populateUserLists();
            });
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

    function initVmLibrary() {
        vm.loadingPromise = libraryService.load(currentLibrary.id)
            .then(function (library) {
                vm.library = library;
            });
        return vm.loadingPromise;
    }

    function initMembershipFees() {
        return membershipService.getMembershipFeesForLibrary(vm.library.id, vm.currentFiscalYear).then(function (r) {
            vm.membershipFees = r;
            return r;
        });
    }

    function populateUserLists() {
        return userService.list()
            .then(filterUserList)
            .then(setVmUserLists);

        function filterUserList(users) {
            return users.filter(function (u) {
                return userBelongsToThisLibrary(u) && userIsNotStaff(u);
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
            vm.inactiveUserList = users.filter(inactiveUsersForThisLibrary);

            function adminUsersForThisLibrary(u) {
                return u.isActive && u.roles.indexOf('readonly') == -1;
            }

            function readOnlyUsersForThisLibrary(u) {
                return u.isActive && u.roles.indexOf('readonly') >= 0;
            }
            function inactiveUsersForThisLibrary(u) {
                return !u.isActive && u.roles.indexOf('readonly') >= 0;
            }
        }
    }
}
