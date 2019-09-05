var Q = require('q');

var couchUtils = require('../CARLI/Store/CouchDb/Utils')();

throw new Error("Missing couch base URL");

couchUtils.couchRequest(couchBaseUrl + '/_all_dbs')
    .then(addSecurityDocs);

function addSecurityDocs(dbs) {
    return Q.all(dbs.map(addSecurityDoc));
}

function addSecurityDoc(dbName) {
    if (dbName[0] === '_')
        return Q(true);

    if (dbName === 'carli')
        return addSecurityDocForMainDb(dbName);
    else if (dbName.length < 30)
        return addSecurityDocForCycleDb(dbName);
    else
        return addSecurityDocForVendorDb(dbName);
}

function addSecurityDocForMainDb(dbName) {
    return addSecurityDocWithRoles(dbName, ["_admin","staff","vendor","library"]);
}
function addSecurityDocForCycleDb(dbName) {
    return addSecurityDocWithRoles(dbName, ["_admin","staff"]);
}
function addSecurityDocForVendorDb(dbName) {
    var roles = ["_admin","staff"];

    var idMatch = dbName.match(/cycle-fiscal-year-[0-9]{4}-(.*)/);
    var id = idMatch[1];
    roles.push('vendor-' + id);

    return addSecurityDocWithRoles(dbName, roles);
}

function addSecurityDocWithRoles(dbName, roles) {
    return couchRequest({
        method: 'put',
        url: couchBaseUrl + '/' + dbName + '/_security',
        json: {
            admins: {
                names: [],
                roles:[]
            },
            members: {
                names: [],
                roles: roles
            }
        }
    });
}
