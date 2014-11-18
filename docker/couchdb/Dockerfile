FROM klaemo/couchdb:1.6.1
MAINTAINER carli@pixotech.com

# Enable CORS
RUN sed -e 's/^enable_cors = .*$/enable_cors = true/' -i /usr/local/etc/couchdb/default.ini

# Allow all CORS origins
RUN sed -e 's/^;origins = \*$/origins = */' -i /usr/local/etc/couchdb/default.ini

EXPOSE 5984
