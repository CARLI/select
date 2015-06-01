angular.module('carli.sections.users')
.controller('userController', userController);

function userController( $sce, userService ){
    var vm = this;
    vm.activeCycles = [];
    vm.afterUserSubmit = populateUserList;
    activate();

    function activate() {
        populateUserList();
    }

    function populateUserList() {
        vm.loadingPromise = userService.list().then( function(userList){
            vm.userList = userList;
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

