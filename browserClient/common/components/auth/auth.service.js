angular.module('common.auth')
    .service('authService', authService);

function authService($rootScope, $q, $location, CarliModules) {
    var session = null;
    var user = null;

    return {
        authenticateForStaffApp: authenticateForStaffApp,

        isRouteProtected: isRouteProtected,

        createSession: createSession,
        deleteSession: deleteSession,

        getCurrentUser: getCurrentUser,

        requireSession: requireSession,
        requireStaff: requireStaff,
        requireActive: requireActive,
        redirectToLogin: redirectToLogin
    };

    function authenticateForStaffApp() {
        return requireSession()
            .then(requireStaff)
            .then(getCurrentUser)
            .then(requireActive)
            .catch(redirectToLogin);
    }

    function isRouteProtected() {
        return $location.url().slice(0, 7) !== '/reset/' && $location.url().slice(0, 6) !== '/login';
    }

    function createSession(userLogin) {
        return $q.when ( CarliModules.AuthMiddleware.createSession(userLogin) )
            .then(function (newSession) {
                session = newSession;
                return session;
            });
    }

    function deleteSession() {
        return $q.when(CarliModules.AuthMiddleware.deleteSession()).then(redirectToLogin);

    }

    function getCurrentUser() {
        if (session) {
            return getUserFromSession();
        } else {
            return requireSession().then(getUserFromSession);
        }

        function getUserFromSession() {
            return $q.when( CarliModules.Auth.getUser(session.name) )
                .then(saveUserReference)
                .then(setLoggedIn);
        }

        function saveUserReference(foundUser) {
            user = foundUser;
            return foundUser;
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
        if (session.roles.indexOf('staff') >= 0) {
            return true;
        }
        throw new Error('Unauthorized');
    }

    function requireActive() {
        if (user.isActive) {
            return true;
        }
        throw new Error('Unauthorized');
    }


    function redirectToLogin(passthrough) {
        $rootScope.isLoggedIn = false;
        $location.url('/login');
        return passthrough;
    }
}
