angular.module('carli.userMenu')
.controller('userMenuController', userMenuController);

function userMenuController( $interval, authService, notificationService ){
    var vm = this;

    vm.notificationsCount = 0;
    vm.userName = '';

    authService.getCurrentUser().then(function (user) {
        vm.userName = user.fullName;
    });

//    $interval(function() {
        countDrafts().then(function(count) {
            vm.notificationsCount = count;
        });
//    }, 2000);

    function countDrafts(){
        return notificationService.listDrafts()
            .then(function(draftsList){
                return draftsList.length;
            });
    }
}
