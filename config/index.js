var _ = require('lodash');

//don't let this get browserified because it uses ES6 which breaks uglify
var environmentVariableNodePackageName = 'dotenv';

var config = loadConfiguration();
makeLoggerGlobal();

var storeOptionsForCycles = null;

function getConfig(key) {
    const defaults = {
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
        COUCH_DB_HOST: "",
        COUCH_DB_PASSWORD: "",
        COUCH_DB_URL_SCHEME: "",
        COUCH_DB_USER: "",
        CRM_MYSQL_HOST: "",
        CRM_MYSQL_PASSWORD: "",
        CRM_MYSQL_USER: "",
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
    return value === "true" ? true : false;
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

function loadConfiguration() {
    var config = getConfigFromEnvironment();

    setMiddlewareUrl();
    setCouchDbUrl();
    setWebAppUrls();

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
            staffWebAppUrl: "http://staff.carli.local/",
            libraryWebAppUrl: "http://library.carli.local/",
            vendorWebAppUrl: "http://vendor.carli.local/",
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

    function setWebAppUrls() {
        if (isBrowserEnvironment()) {
            if (locationHostnameEndsWith('.qa.pixotech.com')) {
                config.staffWebAppUrl = "http://carli-staff.qa.pixotech.com";
                config.libraryWebAppUrl = "http://carli-library.qa.pixotech.com";
                config.vendorWebAppUrl = "http://carli-vendor.qa.pixotech.com";
            } else if (locationHostnameEndsWith('-stage.carli.illinois.edu')) {
                config.staffWebAppUrl = "http://select-staff-stage.carli.illinois.edu";
                config.libraryWebAppUrl = "http://select-library-stage.carli.illinois.edu";
                config.vendorWebAppUrl = "http://select-vendor-stage.carli.illinois.edu";
            } else if (locationHostnameEndsWith('-devel.carli.illinois.edu')) {
                config.staffWebAppUrl = "http://select-staff-devel.carli.illinois.edu";
                config.libraryWebAppUrl = "http://select-library-devel.carli.illinois.edu";
                config.vendorWebAppUrl = "http://select-vendor-devel.carli.illinois.edu";
            } else if (locationHostnameEndsWith('-test.carli.illinois.edu')) {
                config.staffWebAppUrl = "http://select-staff-test.carli.illinois.edu";
                config.libraryWebAppUrl = "http://select-library-test.carli.illinois.edu";
                config.vendorWebAppUrl = "http://select-vendor-test.carli.illinois.edu";
            } else if (locationHostnameEndsWith('.carli.illinois.edu')) {
                config.staffWebAppUrl = "http://select-staff.carli.illinois.edu";
                config.libraryWebAppUrl = "http://select-library.carli.illinois.edu";
                config.vendorWebAppUrl = "http://select-vendor.carli.illinois.edu";
            } else {
                config.staffWebAppUrl = "http://staff.carli.local:8080/";
                config.libraryWebAppUrl = "http://library.carli.local:8080/";
                config.vendorWebAppUrl = "http://vendor.carli.local:8080/";
            }
        }
    }
}

function locationHostnameEndsWith(domain) {
    return window.location.hostname.slice(-1 * domain.length) === domain;
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

if (isBrowserEnvironment())
    window.CARLI_CONFIG = JSON.stringify(config, null, "  ");

module.exports = config;
