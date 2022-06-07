#!/usr/bin/env node

// usage notes
// arguments: <databaseUrl>
// sample usage: node bin/lowercase-user-names.js http://admin:chicken@host.docker.internal:5984

var util = require('util');
var cli = require('../CARLI/CommandLine');

var request = require('request');
const asyncPut = util.promisify(request.put);
const asyncDelete = util.promisify(request.delete);
const asyncGet = util.promisify(request.get);

cli.withArguments(lowercaseUserNames);

async function lowercaseUserNames(databaseUrl) {
    const usersThatNeedRenaming = await getUsersThatNeedRenaming(databaseUrl);

    await usersThatNeedRenaming.reduce(async (acc, user) => {
        await acc;
        const originalId = user.id;

        console.log(`Renaming ${user.id}...`);

        const userDocResponse = await asyncGet({
            url: `${databaseUrl}/_users/${user.id}`
        });
        const userDoc = JSON.parse(userDocResponse.body);
        const originalRev = userDoc._rev;

        delete userDoc._rev;
        delete userDoc._id;
        userDoc.id = userDoc.id.toLowerCase();
        userDoc.name = userDoc.name.toLowerCase();

        await asyncPut({
            url: `${databaseUrl}/_users/${userDoc.id}`,
            json: userDoc
        });
        console.log(`Finished Renaming ${user.id}!`);

        console.log(`Deleting original user ${originalId}...`);
        await asyncDelete({
            url: `${databaseUrl}/_users/${originalId}?rev=${originalRev}`
        });

        console.log(`Deleted ${originalId}!`);
    }, Promise.resolve(null));

    process.exit(0);
}

async function getUsersThatNeedRenaming(databaseUrl) {
    const usersResponse = await asyncGet({
        url: `${databaseUrl}/_users/_all_docs`
    });

    const users = JSON.parse(usersResponse.body).rows;
    const usersThatNeedRenaming = users.filter(user => {
        if(user.id.indexOf("_design/") > -1)
            return false;

        return user.id !== user.id.toLowerCase();
    });

    return usersThatNeedRenaming;
}
