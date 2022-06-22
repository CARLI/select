#!/usr/bin/env node

const cli = require('../CARLI/CommandLine');
const couchUtils = require('../CARLI/Store/CouchDb/Utils')();

cli.withArguments(fixVendorStatusConflicts);

function fixVendorStatusConflicts(cycleType, cycleYear) {
    if (!cycleType || !cycleYear) {
        console.log(`usage: list-duplicate-vendor-status-for-cycle.js cycleType cycleYear

       cycleType: "Calendar Year"
       cycleYear: 2021
`);
        process.exit(1);
    }
    let cycleDbName = "";
    return cli.asCouchAdmin(listDuplicateVendorStatusDocumentsInCycle);

    async function listDuplicateVendorStatusDocumentsInCycle() {
        const cycle = (await couchUtils.getCouchViewResultValues("carli", "listByType", "Cycle"))
            .filter(cycle => cycle.cycleType === cycleType && cycle.year == cycleYear)[0];
        cycleDbName = cycle.databaseName;
        console.log(`Using cycle database: ${cycleDbName}`);
        const vendorStatuses = await couchUtils.getCouchViewResultValues(cycleDbName, "listByType", "VendorStatus");
        const vendorStatusDocIds = vendorStatuses.reduce((a, b)=> {
            let x = a ? a : {};
            x[b.vendor] ?
                x[b.vendor].push(b.id) :
                x[b.vendor] = [b.id];

            return x;
        }, {});

        const vendorsWithDuplicateStatus = Object.keys(vendorStatusDocIds)
            .filter(vendorId => vendorStatusDocIds[vendorId].length > 1);

        for (const vendor of vendorsWithDuplicateStatus) {
            const vendorDoc = (await couchUtils.getCouchDocuments('carli', [vendor]))[0];
            const statusDocs = (await couchUtils.getCouchDocuments(cycleDbName, vendorStatusDocIds[vendor]));
            const docPaths = [cycleDbName, `${cycleDbName}-${vendor}`]
                .map(db => {
                    return statusDocs.map(doc => `${db}/${doc.id}?rev=${doc._rev}`);
                })
                .flat();
            console.log(`Vendor ${vendorDoc.name} (${vendor}) has duplicate status docs:`, statusDocs);
            console.log(`Document paths:`, docPaths);
        }
    }
}

