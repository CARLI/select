angular.module('common.auth')
    .service('authService', authService);

function authService($rootScope, $q, $location, $window, appState, CarliModules, persistentState) {
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
        userIsReadOnly: userIsReadOnly,

        refreshSession: requireSession, // not a typo
        requireSession: requireSession,
        requireStaff: requireStaff,
        requireActive: requireActive,
        redirectToLogin: redirectToLogin,

        isMasqueradingRequested: isMasqueradingRequested,
        initializeMasquerading: initializeMasquerading
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
        persistentState.clearCurrentCycle();
        return $q.when(CarliModules.AuthMiddleware.deleteSession()).then(redirectToLogin);
    }

    function getCurrentUser() {
        if (!user) {
            throw new Error('No user');
        }
        return user;
    }

    function userIsReadOnly() {
        return getCurrentUser().roles.indexOf('readonly') != 0;
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

    function isMasqueradingRequested() {
        return isMasqueradingRequestedForLibrary() || isMasqueradingRequestedForVendor();
    }
    function isMasqueradingRequestedForLibrary() {
        var queryParameters = $location.search();
        return !!queryParameters[ 'masquerade-as-library' ];
    }
    function isMasqueradingRequestedForVendor() {
        var queryParameters = $location.search();
        return !!queryParameters[ 'masquerade-as-vendor' ];
    }

    function initializeMasquerading() {
        var queryParameters = $location.search();
        var masqueradeAsPromise = $q.when(true);

        if (isMasqueradingRequestedForLibrary()) {
            masqueradeAsPromise = masqueradeAsLibrary(queryParameters[ 'masquerade-as-library' ]);
        }
        if (isMasqueradingRequestedForVendor()) {
            masqueradeAsPromise = masqueradeAsVendor(queryParameters[ 'masquerade-as-vendor' ]);
        }

        return masqueradeAsPromise;
    }
    function masqueradeAsLibrary(libraryId) {
        return $q.when( CarliModules.AuthMiddleware.masqueradeAsLibrary(libraryId) );
    }
    function masqueradeAsVendor(vendorId) {
        return $q.when( CarliModules.AuthMiddleware.masqueradeAsVendor(vendorId) );
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
