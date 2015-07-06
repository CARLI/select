angular.module('common.auth')
    .service('authService', authService);

function authService($rootScope, $q, $location, appState, CarliModules) {
    var session = null;
    var user = null;

    return {
        authenticateForStaffApp: authenticateForStaffApp,
        authenticateForVendorApp: authenticateForVendorApp,
        authenticateForLibraryApp: authenticateForLibraryApp,

        isRouteProtected: isRouteProtected,

        createSession: createSession,
        deleteSession: deleteSession,

        getCurrentUser: getCurrentUser,
        fetchCurrentUser: fetchCurrentUser,

        requireSession: requireSession,
        requireStaff: requireStaff,
        requireActive: requireActive,
        redirectToLogin: redirectToLogin
    };

    function authenticateForStaffApp() {
        return requireSession()
            .then(requireStaff)
            .then(fetchCurrentUser)
            .then(requireActive)
            .catch(redirectToLogin);
    }
    function authenticateForVendorApp() {
        return requireSession()
            .then(requireVendor)
            .then(fetchCurrentUser)
            .then(requireActive)
            .catch(redirectToLogin);
    }
    function authenticateForLibraryApp() {
        return requireSession()
            .then(requireLibrary)
            .then(fetchCurrentUser)
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
        session = null;
        user = null;
        $rootScope.isLoggedIn = false;
        return $q.when(CarliModules.AuthMiddleware.deleteSession()).then(redirectToLogin);

    }

    function getCurrentUser() {
        if (!user) {
            throw new Error('No user');
        }
        return user;
    }

    function fetchCurrentUser() {
        if (user) {
            return $q.when(user);
        }

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
            appState.setUser(user);
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
        if (!hasRole('staff')) {
            throw new Error('Unauthorized');
        }
    }

    function requireVendor() {
        if (!hasRole('vendor')) {
            throw new Error('Unauthorized');
        }
    }

    function requireLibrary() {
        if (!hasRole('library')) {
            throw new Error('Unauthorized');
        }
    }

    function hasRole(role) {
        return session.roles.indexOf(role) >= 0;

    }

    function requireActive() {
        if (user.isActive) {
            return true;
        }
        throw new Error('Unauthorized');
    }


    function redirectToLogin(passthrough) {
        $rootScope.isLoggedIn = false;
        $rootScope.returnTo = $location.url();
        $location.url('/login');
        return passthrough;
    }
}
