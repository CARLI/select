
* `brew install couchdb`

Edit `/usr/local/etc/couchdb/default.ini` to enable cors.

    [httpd]
    - enable_cors = false 
    + enable_cors = true

    [cors]
    - ; origins = *
    + origins = *

You can use the `/db/deploy` shell script to conveniently deploy a
database named `testy`.  That's what is currently expected in the
testing/dev environments.