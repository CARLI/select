angular.module('vendor.currentUser')
.service('currentUser', currentUserService);

function currentUserService($rootScope) {
    $rootScope.currentUser = { userName: 'Username!' };

    return $rootScope.currentUser;
}
