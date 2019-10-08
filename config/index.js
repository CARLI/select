
var _ = require('lodash');
//don't let this get browserified because it uses ES6 which breaks uglify
var environmentVariableNodePackageName = 'dotenv';

var config = loadConfiguration();
makeLoggerGlobal();

var storeOptionsForCycles = null;

const browserConfigBlacklist = [ "CRM_MYSQL_PASSWORD", "COUCH_DB_PASSWORD", "SMTP_PASSWORD" ];
function isConfigSafeToExposeToWebBrowser(key) {
    return browserConfigBlacklist.indexOf(key) === -1;
}

function getConfig(key) {
    const defaults = {
        STAFF_APP_URL: "http://staff.carli.local:8080/",
        LIBRARY_APP_URL: "http://library.carli.local:8080/",
        VENDOR_APP_URL: "http://vendor.carli.local:8080/",
        ALERT_TIMEOUT: "10000",
        AUTH_MILLISECONDS_UNTIL_WARNING: "3000000",
        AUTH_WARNING_DURATION_MILLISECONDS: "600000",
        INVOICE_DATA_DIR: "/var/local/carli",
        MIDDLEWARE_URL: "http://127.0.0.1:3000",
        MIDDLEWARE_PORT: "3000",
        NOTIFICATIONS_FROM: "kllittle@uillinois.edu",
        MAINTENANCE_MODE_ENABLED: "false",
        MAINTENANCE_MODE_HEADING: "System Maintenance",
        MAINTENANCE_MODE_DETAIL: "Select is currently offline for maintenance.",
        ONE_TIME_PURCHASE_CYCLE_DOC_ID: "one-time-purchase-products-cycle",
        STORE_PATH: "CouchDb/Store",
        ENTITY_CACHE_TTL: "1000",
        STAFF_APP_BROWSING_CONTEXT_ID: "staff-app",
        LIBRARY_APP_BROWSING_CONTEXT_ID: "library-app",
        VENDOR_APP_BROWSING_CONTEXT_ID: "vendor-app",
        COUCH_DB_HOST: "localhost:5984",
        COUCH_DB_PASSWORD: "karplamity",
        COUCH_DB_URL_SCHEME: "http://",
        COUCH_DB_USER: "admin",
        CRM_MYSQL_HOST: "localhost",
        CRM_MYSQL_PASSWORD: "password",
        CRM_MYSQL_USER: "guest_pixo",
        NOTIFICATIONS_OVERRIDE_TO: "",
        CARLI_LISTSERVE_EMAIL: "",
        CARLI_SUPPORT_EMAIL: "",
        SMTP_HOST: "localhost",
        SMTP_IGNORE_TLS: "true",
        SMTP_PASSWORD: "",
        SMTP_PORT: "25",
        SMTP_REQUIRE_TLS: "false",
        SMTP_SECURE: "false",
        SMTP_USER: "",
    };

    return process.env[key] || defaults[key];
}

function parseBool(value) {
    return value === "true";
}
function parseString(value) {
    return value;
}

function getAlertTimeout() {
    return parseInt(getConfig("ALERT_TIMEOUT"));
}
function getAuthMillisecondsUntilWarning() {
    return parseInt(getConfig("AUTH_MILLISECONDS_UNTIL_WARNING"));
}
function getAuthWarningDurationMilliseconds() {
    return parseInt(getConfig("AUTH_WARNING_DURATION_MILLISECONDS"));
}
function getInvoiceDataDir() {
    return parseString(getConfig("INVOICE_DATA_DIR"));
}
function getMiddlewareUrl() {
    return parseString(getConfig("MIDDLEWARE_URL"));
}
function getMiddlewarePort() {
    return parseInt(getConfig("MIDDLEWARE_PORT"));
}
function getNotificationsFrom() {
    return parseString(getConfig("NOTIFICATIONS_FROM"));
}
function getMaintenanceModeEnabled() {
    return parseBool(getConfig("MAINTENANCE_MODE_ENABLED"));
}
function getMaintenanceModeHeading() {
    return parseString(getConfig("MAINTENANCE_MODE_HEADING"));
}
function getMaintenanceModeDetail() {
    return parseString(getConfig("MAINTENANCE_MODE_DETAIL"));
}
function getOneTimePurchaseCycleDocId() {
    return parseString(getConfig("ONE_TIME_PURCHASE_CYCLE_DOC_ID"));
}
function getStorePath() {
    return parseString(getConfig("STORE_PATH"));
}
function getEntityCacheTtl() {
    return parseInt(getConfig("ENTITY_CACHE_TTL"));
}
function getStaffAppBrowsingContextId() {
    return parseString(getConfig("STAFF_APP_BROWSING_CONTEXT_ID"));
}
function getLibraryAppBrowsingContextId() {
    return parseString(getConfig("LIBRARY_APP_BROWSING_CONTEXT_ID"));
}
function getVendorAppBrowsingContextId() {
    return parseString(getConfig("VENDOR_APP_BROWSING_CONTEXT_ID"));
}
function getCouchDbHost() {
    return parseString(getConfig("COUCH_DB_HOST"));
}
function getCouchDbPassword() {
    return parseString(getConfig("COUCH_DB_PASSWORD"));
}
function getCouchDbUrlScheme() {
    return parseString(getConfig("COUCH_DB_URL_SCHEME"));
}
function getCouchDbUser() {
    return parseString(getConfig("COUCH_DB_USER"));
}
function getCrmMysqlHost() {
    return parseString(getConfig("CRM_MYSQL_HOST"));
}
function getCrmMysqlPassword() {
    return parseString(getConfig("CRM_MYSQL_PASSWORD"));
}
function getCrmMysqlUser() {
    return parseString(getConfig("CRM_MYSQL_USER"));
}
function getNotificationsOverrideTo() {
    return parseString(getConfig("NOTIFICATIONS_OVERRIDE_TO"));
}
function getCarliListserveEmail() {
    return parseString(getConfig("CARLI_LISTSERVE_EMAIL"));
}
function getCarliSupportEmail() {
    return parseString(getConfig("CARLI_SUPPORT_EMAIL"));
}
function getSmtpHost() {
    return parseString(getConfig("SMTP_HOST"));
}
function getSmtpIgnoreTls() {
    return parseBool(getConfig("SMTP_IGNORE_TLS"));
}
function getSmtpPassword() {
    return parseString(getConfig("SMTP_PASSWORD"));
}
function getSmtpPort() {
    return parseInt(getConfig("SMTP_PORT"));
}
function getSmtpRequireTls() {
    return parseBool(getConfig("SMTP_REQUIRE_TLS"));
}
function getSmtpSecure() {
    return parseBool(getConfig("SMTP_SECURE"));
}
function getSmtpUser() {
    return parseString(getConfig("SMTP_USER"));
}
function getStaffAppUrl() {
    return parseString(getConfig("STAFF_APP_URL"));
}
function getVendorAppUrl() {
    return parseString(getConfig("VENDOR_APP_URL"));
}
function getLibraryAppUrl() {
    return parseString(getConfig("LIBRARY_APP_URL"));
}

function loadConfiguration() {
    var config = getConfigFromEnvironment();

    setMiddlewareUrl();
    setCouchDbUrl();
    return config;

    function getConfigFromEnvironment() {
        return {
            alertTimeout: getAlertTimeout(),
            authMillisecondsUntilWarningAppears: getAuthMillisecondsUntilWarning(),
            authWarningDurationInMilliseconds: getAuthWarningDurationMilliseconds(),
            invoiceDataDir: getInvoiceDataDir(),
            middleware: {
                url: getMiddlewareUrl(),
                port: getMiddlewarePort(),
            },
            notifications: {
                from: getNotificationsFrom(),
            },
            maintenanceMode: {
                enabled: getMaintenanceModeEnabled(),
                heading: getMaintenanceModeHeading(),
                detail: getMaintenanceModeDetail()
            },
            oneTimePurchaseProductsCycleDocId: getOneTimePurchaseCycleDocId(),
            storePath: getStorePath(),
            defaultEntityCacheTimeToLive: getEntityCacheTtl(),
            staffAppBrowsingContextId: getStaffAppBrowsingContextId(),
            libraryAppBrowsingContextId: getLibraryAppBrowsingContextId(),
            vendorAppBrowsingContextId: getVendorAppBrowsingContextId(),
            staffWebAppUrl: getStaffAppUrl(),
            libraryWebAppUrl: getLibraryAppUrl(),
            vendorWebAppUrl: getVendorAppUrl(),
            smtp: {
                host: getSmtpHost(),
                port: getSmtpPort(),
                secure: getSmtpSecure(),
                ignoreTLS: getSmtpIgnoreTls()
            },
            storeOptions: getStoreOptionsFromEnvironment(),
            memberDb: {
                connectionLimit: 10,
                host: getCrmMysqlHost(),
                user: getCrmMysqlUser(),
                password: getCrmMysqlPassword(),
                database: "carli_crm"
            },
            restrictedApiV1: {
                username: "",
                password: ""
            }
        };
    }

    function getStoreOptionsFromEnvironment() {
        var scheme = getCouchDbUrlScheme();
        var user = getCouchDbUser();
        var password = getCouchDbPassword();
        var host = getCouchDbHost();

        if (isBrowserEnvironment())
            return {
                couchDbName: "carli",
                couchDbUrl: scheme + host,
            };

        return {
            couchDbName: "carli",
            couchDbUrl: scheme + host,
            privilegedCouchUrlScheme: scheme,
            privilegedCouchUsername: user,
            privilegedCouchPassword: password,
            privilegedCouchHostname: host,
            privilegedCouchDbUrl: scheme + user + ':' + password + '@' + host
        };
    }

    function setMiddlewareUrl() {
        if (isBrowserEnvironment()) {
            var l = window.location;
            config.middleware.url = l.protocol + '//' + l.host + '/api';
        }
    }

    function setCouchDbUrl() {
        if (isBrowserEnvironment()) {
            setCouchDbUrlForBrowser();
        }

        function setCouchDbUrlForBrowser() {
            var l = window.location;
            config.storeOptions.couchDbUrl = l.protocol + '//' + l.host + '/db';
        }
    }
}

function makeLoggerGlobal() {
    var Logger = require('../CARLI/Logger');

    if (isBrowserEnvironment()) {
        window.Logger = Logger;
    } else {
        global.Logger = Logger;
    }
}

function isSecureEnvironment() {
    return !isBrowserEnvironment();
}

function isBrowserEnvironment() {
    return (typeof window !== 'undefined');
}

config.setDbName = function (name) {
    config.storeOptions.couchDbName = name;
};
config.getDbName = function () {
    return config.storeOptions.couchDbName;
};
config.getMiddlewareUrl = function () {
    return config.middleware.url;
};
config.setStoreOptionsForCycles = function (storeOptions) {
    storeOptionsForCycles = storeOptions;
};
config.getStoreOptionsForCycles = function () {
    return storeOptionsForCycles || config.storeOptions;
};
config.getAuthTimeoutDuration = function () {
    return config.authMillisecondsUntilWarningAppears + config.authWarningDurationInMilliseconds;
};

config.isConfigSafeToExposeToWebBrowser = isConfigSafeToExposeToWebBrowser;

const getLegacyValue = (key) => {
    const lookupTable = {
        'ALERT_TIMEOUT': config.alertTimeout,
        'AUTH_MILLISECONDS_UNTIL_WARNING': config.authMillisecondsUntilWarningAppears,
        'AUTH_WARNING_DURATION_MILLISECONDS': config.authWarningDurationInMilliseconds,
        'CARLI_LISTSERVE_EMAIL': config.notifications.carliListServe,
        'MAINTENANCE_MODE_ENABLED': config.maintenanceMode.enabled,
        'MAINTENANCE_MODE_HEADING': config.maintenanceMode.heading,
        'MAINTENANCE_MODE_DETAIL': config.maintenanceMode.detail,
        'ONE_TIME_PURCHASE_CYCLE_DOC_ID': config.oneTimePurchaseProductsCycleDocId,
        'STAFF_APP_BROWSING_CONTEXT_ID': config.staffAppBrowsingContextId,
        'LIBRARY_APP_BROWSING_CONTEXT_ID': config.libraryAppBrowsingContextId,
        'VENDOR_APP_BROWSING_CONTEXT_ID': config.vendorAppBrowsingContextId,
        'STAFF_APP_URL': config.staffWebAppUrl,
        'LIBRARY_APP_URL': config.libraryWebAppUrl,
        'VENDOR_APP_URL': config.vendorWebAppUrl,
    };

    return lookupTable[key];
};
config.getValue = getLegacyValue;

if (isBrowserEnvironment())
    window.CARLI_CONFIG = JSON.stringify(config, null, "  ");

module.exports = config;
