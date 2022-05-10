#!/usr/bin/env node

const couchUtils = require('../CARLI/Store/CouchDb/Utils')();
const db = require('../db/deploy');

async function addRoles() {
    const databases = await couchUtils.listDatabases();
    const databasesToEdit = databases.filter(dbName => dbName !== '_users' && dbName !== '_replicator' && dbName !== 'activity-log');

    await databasesToEdit.reduce((acc, dbName) => acc.then(() => db.addRoleToSecurityDoc(dbName, 'readonly-staff')), Promise.resolve(null));
}

addRoles().then(process.exit);

