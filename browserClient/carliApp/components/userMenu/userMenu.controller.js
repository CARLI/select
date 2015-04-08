angular.module('carli.userMenu')
.controller('userMenuController', userMenuController);

function userMenuController( $interval, notificationService ){
    var vm = this;

    vm.notificationsCount = 0;
    vm.userName = 'Username!';

    $interval(function() {
        countDrafts().then(function(count) {
            vm.notificationsCount = count;
        });
    }, 2000);


    function countDrafts(){
        return notificationService.listDrafts()
            .then(function(draftsList){
                return draftsList.length;
            });
    }
}