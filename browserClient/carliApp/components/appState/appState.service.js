angular.module('carli.appState')
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
            $rootScope.appState = 'ready';
        }
    }

    function setCycle(cycle) {
        $rootScope.cycleId = cycle.id;
    }


}
