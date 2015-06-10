angular.module('vendor.appState')
    .service('appState', appStateService);

function appStateService($rootScope) {
    return {
        setUser: setUser,
        setCycle: setCycle
    };

    function setUser(user) {
        if (!user) {
            $rootScope.appState = 'pendingUser';
        } else {
            $rootScope.appState = 'pendingCycle';
        }
    }

    function setCycle(cycle) {
        $rootScope.appState = 'ready';
        $rootScope.cycleType = cycle.cycleType;
    }


}
