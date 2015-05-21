angular.module('carli.userMenu')
.controller('userMenuController', userMenuController);

function userMenuController( $interval, authService, notificationService ){
    var vm = this;

    vm.notificationsCount = 0;
    vm.userName = '';

    vm.logout = authService.deleteSession;

    activate();

    function activate() {
        loadUserInfo();
        updateNotificationCount();
    }

    function loadUserInfo() {
        authService.getCurrentUser().then(function (user) {
            vm.userName = user.fullName;
        });
    }

    function updateNotificationCount() {
//    $interval(function() {
        countDrafts().then(function (count) {
            vm.notificationsCount = count;
        });
//    }, 2000);
    }

    function countDrafts(){
        return notificationService.listDrafts()
            .then(function(draftsList){
                return draftsList.length;
            });
    }
}
