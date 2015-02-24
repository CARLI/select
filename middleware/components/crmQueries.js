var config = require('../../config');
var mysql = require('mysql');
var Q = require('q');

function listLibraries() {
    var deferred = Q.defer();
    var connection = mysql.createConnection(config.memberDb);
    connection.connect();

    connection.query(
        'SELECT m.institution_name, m.member_id, m.fte, m.library_type, m.membership_lvl ' +
        'FROM members AS m',
        null,
        function(err, rows, fields) {
            var libraries = extractRowsFromResponse(err, rows, convertCrmLibrary);
            deferred.resolve(libraries);
        }
    );

    connection.end();

    return deferred.promise;
}

function loadLibrary(id) {
    var deferred = Q.defer();
    var connection = mysql.createConnection(config.memberDb);
    connection.connect();

    connection.query(
        'SELECT m.institution_name, m.member_id, m.fte, m.library_type, m.membership_lvl ' +
        'FROM members AS m ' +
        'WHERE m.member_id = ?',
        [ id ],
        function(err, rows, fields) {
            var libraries = extractRowsFromResponse(err, rows, convertCrmLibrary);
            deferred.resolve(libraries[0]);
        }
    );

    connection.end();

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
    };
}

function convertCrmInstitutionType(crmType) {
    switch (crmType) {
        case 'OTH': return 'Other';
        case 'PRI': return 'Private';
        case 'CC': return 'Other';
        case 'PUB': return 'Public';
        default: return 'Other';
    };
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
        crmId: crm.member_id,
        name: crm.institution_name,
        institutionYears: convertCrmInstitutionYearsFromType(crm.library_type),
        institutionType: convertCrmInstitutionType(crm.library_type),
        // ipAddresses: "", // Stored in Select database
        "membershipLevel": convertCrmMembershipLevel(crm.membership_lvl),
        // "isIshareMember": crm.is_share_member ? true : false,
        // "gar": "",
        "isActive": true,
        "outstandingBalances": [],
        "contacts": []
    };
    if (crm.fte) {
        library.fte = parseInt(crm.fte);
    }
    return library;
}

module.exports = {
    listLibraries: listLibraries,
    loadLibrary: loadLibrary
};