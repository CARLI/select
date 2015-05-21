angular.module('common.auth')
    .service('authService', authService);

function authService($rootScope, $q, $location, CarliModules) {
    var session = null;

    return {
        createSession: createSession,
        deleteSession: deleteSession,
        getCurrentUser: getCurrentUser,
        requireSession: requireSession,
        requireStaff: requireStaff,
        redirectToLogin: redirectToLogin
    };

    function createSession(userLogin) {
        return $q.when ( CarliModules.Auth.createSession(userLogin) )
            .then(function (newSession) {
                session = newSession;
                return session;
            });
    }

    function deleteSession() {
        return $q.when(CarliModules.Auth.deleteSession()).then(redirectToLogin);

    }

    function getCurrentUser() {
        if (session) {
            return getUserFromSession();
        } else {
            return requireSession().then(getUserFromSession);
        }

        function getUserFromSession() {
            return $q.when( CarliModules.Auth.getUser(session.name) )
                .then(setLoggedIn);
        }

        function setLoggedIn(passthrough) {
            $rootScope.isLoggedIn = true;
            return passthrough;
        }
    }

    function requireSession() {
        return $q.when ( CarliModules.Auth.getSession() )
            .then(function (newSession) {
                if (newSession.name) {
                    session = newSession;
                    return session;
                }
                return $q.reject('Authentication required');
            });
    }

    function requireStaff() {
        return session.roles.indexOf('staff') >= 0;
    }

    function redirectToLogin(passthrough) {
        $rootScope.isLoggedIn = false;
        $location.url('/login');
        return passthrough;
    }
}
