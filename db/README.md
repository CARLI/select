
* `brew install couchdb`
* `curl -X PUT http://localhost:5984/testy`
* `cd ./db`
* `couchapp push CARLI-DesignDoc.js http://localhost:5984/testy`

Edit `/usr/local/etc/couchdb/default.ini` to enable cors.

    [httpd]
    - enable_cors = false 
    + enable_cors = true

    [cors]
    - ; origins = *
    + origins = *
