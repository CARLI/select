var config = require('../../config');
var mysql = require('mysql');
var Q = require('q');

var pool = mysql.createPool(config.memberDb);

var selectLibrary = 'SELECT m.institution_name, m.member_id, m.library_type, m.membership_lvl, m.current, p.product_id as is_ishare ' +
                    'FROM members AS m LEFT JOIN subscribed_products p ON (m.member_id = p.member_id AND p.product_id = 1) ';

function listLibraries() {
    var deferred = Q.defer();
    pool.getConnection(function(err, connection) {

        if ( err ){
            return handleError( deferred, 'pool.getConnection error listing libraries', err);
        }

        connection.query(
            selectLibrary,
            null,
            function(err, rows, fields) {
                if ( err ){
                    handleError( deferred, 'query error listing libraries', err);
                }
                else {
                    var libraries = extractRowsFromResponse(err, rows, convertCrmLibrary);
                    deferred.resolve(libraries);
                }
            }
        );

        connection.release();
    });

    return deferred.promise;
}

function loadLibrary(id) {
    var deferred = Q.defer();
    pool.getConnection(function(err, connection) {

        if ( err ){
            return handleError( deferred, 'pool.getConnection error loading library', err);
        }

        connection.query(
            selectLibrary + 'WHERE m.member_id = ?',
            [id],
            function (err, rows, fields) {
                if ( err ){
                    handleError( deferred, 'query error loading library', err);
                }
                else {
                    var libraries = extractRowsFromResponse(err, rows, convertCrmLibrary);
                    deferred.resolve(libraries[0]);
                }
            }
        );

        connection.release();
    });

    return deferred.promise;
}

function extractRowsFromResponse(err, rows, processCallback) {
    if (err) {
        throw new Error(err);
    }

    if (!processCallback) {
        processCallback = function identity(x) { return x; };
    }

    var returnRows = [];

    if (rows) {
        rows.forEach(function (row) {
            returnRows.push(processCallback(row));
        });
        return returnRows;
    }

    return false;
}

function convertCrmInstitutionYearsFromType(crmType) {
    switch (crmType) {
        case 'OTH': return 'Other';
        case 'PRI': return '4 Year';
        case 'CC': return '2 Year';
        case 'PUB': return '4 Year';
        default: return 'Other';
    }
}

function convertCrmInstitutionType(crmType) {
    switch (crmType) {
        case 'OTH': return 'Other';
        case 'PRI': return 'Private';
        case 'CC': return 'Public';
        case 'PUB': return 'Public';
        default: return 'Other';
    }
}

function convertCrmMembershipLevel(crmLevel) {
    switch (crmLevel) {
        case 'BASIC': // fallthrough
        case 'ASSOCIATE': // fallthrough
        case 'AFFILIATE': return 'Affiliate';
        case 'GOVERNING': return 'Governing';
        default: return 'Non-Member';
    }
}

function convertCrmLibrary(crm) {
    var library = {
        type: 'Library',
        crmId: crm.member_id.toString(),
        name: crm.institution_name,
        institutionYears: convertCrmInstitutionYearsFromType(crm.library_type),
        institutionType: convertCrmInstitutionType(crm.library_type),
        membershipLevel: convertCrmMembershipLevel(crm.membership_lvl),
        isIshareMember: !!crm.is_ishare,
        isActive: isLibraryActive(crm),
        "outstandingBalances": [],
        "contacts": []
    };

    return library;


    function isLibraryActive(crmLibrary){
        return crmLibrary.membership_lvl === 'GOVERNING' && crmLibrary.current === 'y';
    }
}

function handleError( promise, message, error ){
    var errorObject = {
        message: message,
        error: error
    };
    promise.reject(errorObject);
    return errorObject;
}

module.exports = {
    listLibraries: listLibraries,
    loadLibrary: loadLibrary
};
