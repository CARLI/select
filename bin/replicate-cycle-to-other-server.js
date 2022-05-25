#!/usr/bin/env node

// usage notes
// arguments: <source> <target> <cycle-db-name>
// sample usage: node bin/replicate-cycle-to-other-server.js http://admin:chicken@host.docker.internal:5984 http://admin1:chicken1@host.docker.internal:5985 cycle-calendar-year-2022
// use index-all-databases or index-databases-for-cycle after this to get the indexes warmed up

var util = require('util');
var cli = require('../CARLI/CommandLine');

var request = require('request');
const asyncPost = util.promisify(request.post);
const asyncGet = util.promisify(request.get);

cli.withArguments(syncCycleDatabases);

async function syncCycleDatabases(source, target, cycleDatabaseName) {
    const databasesToSync = await getDatabasesToSync(source, cycleDatabaseName);

    const syncPromise = databasesToSync.reduce((acc, item, index) => {
        return acc.then(() => {
            console.log(`Starting sync of database ${index+1} of ${databasesToSync.length}`);
            return syncDatabase(source, target, item);
        });
    }, Promise.resolve(null));

    await syncPromise;
    console.log("Replication complete! Please run index-all-databases or index-databases-for-cycle to warm the indexes");
}

async function getDatabasesToSync(source, cycleDatabaseName) {
    const response = await asyncGet({
        url: `${source}/_all_dbs`
    });
    const databases = JSON.parse(response.body);
    const databasesToSync = ['_users', 'carli'];
    databasesToSync.push(...databases.filter(db => db.indexOf(cycleDatabaseName) > -1));

    return databasesToSync;
}

async function syncDatabase(source, target, dbName) {
    console.log(`Starting to replicate ${dbName}...`);

    const response = await asyncPost({
        url: `${target}/_replicator`,
        json: {
            target: `${target}/${dbName}`,
            source: `${source}/${dbName}`,
            create_target: true
        }
    });

    const replicationDocId = response.body.id;

    return new Promise((resolve, reject) => {
        const intervalHandle = setInterval(async () => {
            const response = await asyncGet({
                url: `${target}/_replicator/${replicationDocId}`
            });

            const body = JSON.parse(response.body);
            const replicationState = body._replication_state;
            console.log(`Currently replicating ${dbName}...`);

            if(replicationState === 'completed') {
                console.log(`Finished replicating ${dbName}!`);
                clearInterval(intervalHandle);
                resolve();
            }
            if(replicationState === 'error') {
                console.log(`Error replicating ${dbName}! Will keep checking to see if couch restarts the job...`);
                console.log(response.body);
            }
        }, 10000);
    });
}
