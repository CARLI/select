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
            label: "User Name",
            orderByProperty: 'name',
            contentFunction: function(user) {
                return $sce.trustAsHtml('<a href="user/' + user.id + '">' + user.name + '</a>');
            }
        },
        {
            label: "Roles",
            orderByProperty: ['vendor.name','name'],
            contentFunction: function(user) {
                return $sce.trustAsHtml('<a href="mailto:' + user.email + '">' + user.email + '</a>');
            }
        }
    ];

}

