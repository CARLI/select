angular.module('carli.sections.users')
.controller('userController', userController);

function userController( $sce, $location, userService ){
    var vm = this;
    vm.activeCycles = [];
    vm.afterUserSubmit = populateUserList;
    activate();

    function activate() {
        populateUserList();
    }

    function populateUserList() {
        var userType = $location.path().substring($location.path().lastIndexOf('/') + 1);

        vm.loadingPromise = userService.list().then( function(userList){
            vm.userList = userList.filter(filterByRole);

            function filterByRole(user) {
                return user.roles.indexOf(userType) >= 0;
            }
        });
    }

    vm.userListColumns = [
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

}

