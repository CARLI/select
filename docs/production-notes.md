
## Components

The app is composed of:
* a front-end browser app, served as a static files by the web server, nginx.
* a middleware app, a stand-alone nodejs process that listens on `localhost:3000`
* The database, CouchDb. Couch is also an http based service, and listens on `localhost:5984`

Notes:
* nginx also serves as a proxy to expose both the middleware api and database api to the browser client app.
* The custom middleware component is installed in /var/www/carli-select.
* Use `sudo service carli-select [start | stop | status]` to control the service directly.

* A control script is installed as `/usr/local/bin/carlictl`, which controls all 3 services (carli-select, couchdb, nginx).

A checked out copy of the source code exists in /home/jenkins/carli-select/.  This is not required for production
to run, but is there for convenience. It contains some utility scripts and documentation.

## Log files

Log files are located in:

* The Select middleware: `/var/log/carli-select.log`
* Web server: `/var/log/nginx/`
* CouchDb: `/var/log/couchdb/`

## Common Tasks

See ./docs/common-database-tasks.md

## Backups

CouchDb keeps it's data in `/var/lib/couchdb`.  It can be snapshotted
and later restored by simply copying the contents of that directory, but
be careful to preserve the ownership of the files (they belong to couchdb).
