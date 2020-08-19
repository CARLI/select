angular.module('common.config')
.factory('config', function( $q, $window ){
    const values = {
        maintenanceMode: {},
        notifications: {}
    };

    const deferred = $q.defer();
    values.waitForConfigToLoad = () => deferred.promise;

    function loadConfigFromMiddleware() {
        const promises = [];

        const loadConfig = (environmentVariable, configObjectKey) => {
            promises.push($window.CARLI.config.getConfig(environmentVariable).then(value => values[configObjectKey] = value));
        };

        loadConfig('STAFF_APP_URL', 'staffWebAppUrl');
        loadConfig('LIBRARY_APP_URL', 'libraryWebAppUrl');
        loadConfig('VENDOR_APP_URL', 'vendorWebAppUrl');
        loadConfig('ALERT_TIMEOUT', 'alertTimeout');
        loadConfig('ONE_TIME_PURCHASE_CYCLE_DOC_ID', 'oneTimePurchaseProductsCycleDocId');
        loadConfig('STAFF_APP_BROWSING_CONTEXT_ID', 'staffAppBrowsingContextId');
        loadConfig('LIBRARY_APP_BROWSING_CONTEXT_ID', 'libraryAppBrowsingContextId');
        loadConfig('VENDOR_APP_BROWSING_CONTEXT_ID', 'vendorAppBrowsingContextId');

        promises.push($window.CARLI.config.getConfig('MAINTENANCE_MODE_ENABLED').then(value => values.maintenanceMode.enabled = value));
        promises.push($window.CARLI.config.getConfig('MAINTENANCE_MODE_HEADING').then(value => values.maintenanceMode.heading = value));
        promises.push($window.CARLI.config.getConfig('MAINTENANCE_MODE_DETAIL').then(value => values.maintenanceMode.detail = value));
        promises.push($window.CARLI.config.getConfig('CARLI_LISTSERVE_EMAIL').then(value => values.notifications.carliListServe = value));

        $q.all(promises).then(() => deferred.resolve(values));

        return deferred.promise;
    }

    values.loadConfigFromMiddleware = loadConfigFromMiddleware;

    values.getMiddlewareUrl = function () {
        var l = $window.location;
        return l.protocol + '//' + l.host + '/api';
    };

    return values;
});
