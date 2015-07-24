var couchapp = require('couchapp');
var path = require('path');

ddoc = {
    _id: '_design/CARLI',
    language: "javascript",
    views: {
        listByType: {
            map: function( doc ) { if ( doc.type ) { emit( doc.type, doc ) } }
        },
        listActivityLogsByDate: {
            map: function( doc ) {
                if ( doc.type === 'ActivityLogEntry' ) {
                    emit( doc.date, doc );
                }
            }
        }
    }
};

module.exports = ddoc;
