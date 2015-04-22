angular.module('vendor.appState')
    .service('appState', appStateService);

function appStateService($rootScope) {
    return {
        setUser: setUser,
        setCycle: setCycle
    };

    function setUser(user) {
        $rootScope.appState = 'pendingCycle';
    }

    function setCycle(cycle) {
        $rootScope.appState = 'ready';
    }


}
