var mysql = require('mysql');
var request = require('request');
var Q = require('q');

var config = require("../../config");

var mysqlConfig = {
    connectionLimit: 10,
    database: "carli_crm",
    host: config.memberDb.host,
    user: config.memberDb.user,
    password: config.memberDb.password
};

var pool = mysql.createPool(mysqlConfig);

var selectLibrary = 'SELECT m.institution_name, m.member_id, m.library_type, m.membership_lvl, m.current, p.product_id as is_ishare ' +
                    'FROM members AS m LEFT JOIN subscribed_products p ON (m.member_id = p.member_id AND p.product_id = 1) ';

function listLibraries() {
    var deferred = Q.defer();

    request('https://select-crm-test.carli.illinois.edu/library', function(error, response, body) {
        if (!!error)
            deferred.reject(error);
        else
            deferred.resolve(JSON.parse(body));
    });

    return deferred.promise;
}

function loadLibrary(id) {
    var deferred = Q.defer();

    request('https://select-crm-test.carli.illinois.edu/library/' + id, function(error, response, body) {
        if (!!error)
            deferred.reject(error);
        else
            deferred.resolve(JSON.parse(body));
    });

    return deferred.promise;
}

function crmContactQuery(crmIdArguments) {
    var crmContactQuery = [
        'SELECT ',
        'm.institution_name as library,',
        'p.first_name,',
        'p.last_name,',
        'p.title,',
        'p.email,',
        'p.phone,',
        'p.phone2,',
        'p.phone3,',
        'p.fax,',
        'p.funct_resp,',
        'p.director,',
        'p.eres_liaison,',
        'p.notes,',
        'p.office_add,',
        'a.address_line1,',
        'a.address_line2,',
        'a.city,',
        'a.state,',
        'a.zip,',
        'a.library_phone,',
        'a.library_fax ',
        'FROM carli_crm.people p,',
        ' carli_crm.address a, ',
        ' carli_crm.members m ',
        'WHERE',
        ' p.address_id = a.address_id AND',
        ' p.member_id = m.member_id AND',
        " (p.director = 'y' or p.eres_liaison = 'y')"
    ].join('');

    var singleIdClause = ' AND p.member_id = ?';
    var multipleIdClause = ' AND p.member_id IN (?)';

    if ( typeof crmIdArguments === 'string' ){
        return crmContactQuery + singleIdClause;
    }
    else if ( crmIdArguments.length ){
        return crmContactQuery + multipleIdClause;
    }
    else {
        return crmContactQuery;
    }
}

function listCrmContactsForLibrary( libraryCrmId ){
    var deferred = Q.defer();

    request('https://select-crm-test.carli.illinois.edu/library/contacts/' + id, function(error, response, body) {
        if (!!error)
            deferred.reject(error);
        else
            deferred.resolve(JSON.parse(body));
    });

    return deferred.promise;
}

function listCrmContactsForLibraryIds( libraryCrmsIds ){
    var queryString = libraryCrmsIds.map(function (id) {
        return 'id[]=' + id;
    }).join('&');
    var deferred = Q.defer();

    request('https://select-crm-test.carli.illinois.edu/library/contacts/?' + queryString, function(error, response, body) {
        if (!!error)
            deferred.reject(error);
        else
            deferred.resolve(JSON.parse(body));
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

    if (rows) {
        return rows.map(processCallback);
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

function convertCrmLibraryContact(row){
    return {
        firstName: row.first_name,
        lastName: row.last_name,
        title: row.title,
        responsibility: row.funct_resp,
        email: row.email,
        phoneNumber: row.phone,
        phoneNumber2: row.phone2,
        phoneNumber3: row.phone3,
        fax: row.fax,
        contactType: contactType(),
        notes: row.notes,
        officeAddress: row.office_add,
        address1: row.address_line1,
        address2: row.address_line2,
        city: row.city,
        state: row.state,
        zip: row.zip,
        libraryPhone: row.library_phone,
        libraryFax: row.library_fax,
        library: row.library
    };

    function contactType(){
        if ( row.director === 'y' ){
            return 'Director';
        }
        else if ( row.eres_liaison === 'y' ){
            return 'E-Resources Liaison';
        }
        else {
            return 'Other';
        }
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
    loadLibrary: loadLibrary,
    listCrmContactsForLibrary: listCrmContactsForLibrary,
    listCrmContactsForLibraryIds: listCrmContactsForLibraryIds,
    mysqlConfig: mysqlConfig
};
