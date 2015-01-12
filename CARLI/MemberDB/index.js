var mysql = require('mysql');
var config = require('../config');
var LibraryRepository = require('../Entity/LibraryRepository');
var Q = require('q');

function identity(x) {
    return x;
}

function extractRowsFromResponse(err, rows, processCallback) {
    if (err) {
        throw new Error(err);
    }

    if (!processCallback) {
        processCallback = identity;
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

function main() {
    var connection = mysql.createConnection(config.memberDb);
    connection.connect();


    connection.end();
}

function listLibraries() {
    var deferred = Q.defer();
    var connection = mysql.createConnection(config.memberDb);
    connection.connect();

    connection.query(
        'SELECT m.institution_name, m.fte, m.library_type, m.membership_lvl, ' +
        '(md.ishare_begin_date < CURDATE() AND (md.ishare_end_date IS NULL OR md.ishare_end_date > CURDATE())) AS is_ishare_member ' +
        'FROM members AS m ' +
        'JOIN member_detail AS md ON m.member_id = md.member_id',
        null,
        function(err, rows, fields) {
            var libraries = extractRowsFromResponse(err, rows, convertCrmLibrary);
            deferred.resolve(libraries);
        }
    );

    connection.end();

    return deferred.promise;
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
        // institutionYears: null,
        institutionType: convertCrmInstitutionType(crm.library_type),
        ipAddresses: "",
        "membershipLevel": convertCrmMembershipLevel(crm.membership_lvl),
        "isIshareMember": crm.is_share_member ? true : false,
        "gar": "",
        "isActive": true,
        "outstandingBalances": [],
        "products": [],
        "contacts": []
    };
    if (crm.fte) {
        library.fte = crm.fte;
    }
    return library;
}

module.exports = {
    listLibraries: listLibraries
};
