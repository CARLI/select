angular.module('common.auth')
    .service('authService', authService);

function authService($rootScope, $q, $location, $window, appState, CarliModules, persistentState) {
    var session = null;
    var user = null;

    var pendingMasqueradeRequest = {
        targetRole: null,
        targetId: null
    };

    listenForIncomingMasqueradeRequests();

    return {
        authenticateForStaffApp: authenticateForStaffApp,
        authenticateForVendorApp: authenticateForVendorApp,
        authenticateForLibraryApp: authenticateForLibraryApp,

        isRouteProtected: isRouteProtected,

        createSession: createSession,
        deleteSession: deleteSession,

        getCurrentUser: getCurrentUser,
        fetchCurrentUser: fetchCurrentUser,
        forceRefetchCurrentUser: forceRefetchCurrentUser,
        userIsReadOnly: userIsReadOnly,

        refreshSession: requireSession, // not a typo
        requireSession: requireSession,
        requireStaff: requireStaff,
        requireActive: requireActive,
        redirectToLogin: redirectToLogin,

        isMasqueradingRequested: isMasqueradingRequested,
        isMasqueradingPending: isMasqueradingPending,
        initializeMasquerading: initializeMasquerading,
        initializePendingMasquerading: initializePendingMasquerading,
    };

    function searchKeyFor(role) {
        return 'masquerade-as-' + role;
    }
    function clearUrlSearchFor(role) {
        $location.search(searchKeyFor(role), null);
    }

    function listenForIncomingMasqueradeRequests() {
        $rootScope.$on('$locationChangeSuccess',
            function (angularEvent, newUrlString) {
                var newUrl = new URL(newUrlString);

                interceptMasqueradeRequest(newUrl);
                allowMasqueradeChooserToBypassCycleChooser(newUrl);
            }
        );
    }

    function interceptMasqueradeRequest(newUrl) {
        var targetRole = parseMasqueradeTargetTypeFromUrl(newUrl);

        if (targetRole !== null) {
            pendingMasqueradeRequest.targetRole = targetRole;
            pendingMasqueradeRequest.targetId = getUrlSearchFor(pendingMasqueradeRequest.targetRole, newUrl);
            clearUrlSearchFor(pendingMasqueradeRequest.targetRole);
        }
    }

    function allowMasqueradeChooserToBypassCycleChooser(newUrl) {
        if (newUrl.pathname == '/masquerade') {
            $rootScope.appState = 'pendingUser';
        }

    }

    function getUrlSearchFor(targetRole, url) {
        return url.searchParams.get(searchKeyFor(targetRole));
    }

    function parseMasqueradeTargetTypeFromUrl(url) {
        if (urlContainsSearchFor('vendor', url)) {
            return 'vendor';
        }
        if (urlContainsSearchFor('library', url)) {
            return 'library';
        }
        return null;
    }

    function urlContainsSearchFor(role, url) {
        return url.searchParams.get(searchKeyFor(role)) !== null;
    }

    function authenticateForStaffApp() {
        return requireSession()
            .then(requireStaffOrReadonly)
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
        return getCurrentUser().roles.indexOf('readonly') >= 0;
    }

    function forceRefetchCurrentUser() {
        user = null;
        return fetchCurrentUser();
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
        return urlContainsSearchFor('library', new URL($location.absUrl()));
    }
    function isMasqueradingRequestedForVendor() {
        return urlContainsSearchFor('vendor', new URL($location.absUrl()));
    }
    function isMasqueradingPending() {
        return pendingMasqueradeRequest.targetRole != null;
    }

    function initializeMasquerading() {
        var queryParameters = $location.search();
        var masqueradeAsPromise = $q.when(true);

        if (isMasqueradingRequestedForLibrary()) {
            interceptMasqueradeRequest(new URL($location.absUrl()));
            masqueradeAsPromise = masqueradeAsLibrary(pendingMasqueradeRequest.targetId);
        }
        if (isMasqueradingRequestedForVendor()) {
            interceptMasqueradeRequest(new URL($location.absUrl()));
            masqueradeAsPromise = masqueradeAsVendor(pendingMasqueradeRequest.targetId);
        }

        return masqueradeAsPromise;
    }
    function masqueradeAsLibrary(libraryId) {
        return $q.when( CarliModules.AuthMiddleware.masqueradeAsLibrary(libraryId) );
    }
    function masqueradeAsVendor(vendorId) {
        return $q.when( CarliModules.AuthMiddleware.masqueradeAsVendor(vendorId) );
    }

    function initializePendingMasquerading() {
        var masqueradeAsPromise = $q.when(true);

        if (isMasqueradingPending()) {
            // We check the pending request because at this point we already cleared the search query.
            if (pendingMasqueradeRequest.targetRole == 'library') {
                masqueradeAsPromise = masqueradeAsLibrary(pendingMasqueradeRequest.targetId);
            }
            if (pendingMasqueradeRequest.targetRole == 'vendor') {
                masqueradeAsPromise = masqueradeAsVendor(pendingMasqueradeRequest.targetId);
            }
        }

        return masqueradeAsPromise;
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

    function requireStaffOrReadonly() {
        if (!hasRole('staff') && !hasRole('readonly-staff')) {
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
