# CARLI Select Configuration

Configuration comes from three places, in order of precedence:

1) Your local configuration, `local.json` in this directory.
2) The environment.
3) The default configuration, `defaults.json` in this directory.

## Local config

When containers are built the `local.json` is set to an empty object.
See `local.json.template` for an example using the default conventions of
the project.

## Environment config

* Couch Configuration
    * COUCH_DB_HOST
    * COUCH_DB_PASSWORD
    * COUCH_DB_URL_SCHEME
    * COUCH_DB_USER
* MySQL (CRM) Database Configuration
    * CRM_MYSQL_HOST
    * CRM_MYSQL_PASSWORD
    * CRM_MYSQL_USER
* Email Configuration
    * NOTIFICATIONS_OVERRIDE_TO
    * CARLI_LISTSERVE_EMAIL
    * CARLI_SUPPORT_EMAIL
    * SMTP_HOST
    * SMTP_IGNORE_TLS
    * SMTP_PASSWORD
    * SMTP_PORT
    * SMTP_REQUIRE_TLS
    * SMTP_SECURE
    * SMTP_USER

## Default config

See `defaults.json`
