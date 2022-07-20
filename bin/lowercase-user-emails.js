#!/usr/bin/env node

// usage notes
// arguments: <databaseUrl>
// sample usage: node bin/lowercase-user-emails.js http://admin:chicken@host.docker.internal:5984

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

        console.log(`Lower-casing email for ${user.email}...`);
        user.email = user.email.toLowerCase();

        await asyncPut({
            url: `${databaseUrl}/_users/${user.id}`,
            json: user
        });

        console.log('√');
    }, Promise.resolve(null));

    console.log(`All done!`);
    process.exit(0);
}

async function getUsersThatNeedRenaming(databaseUrl) {
    const usersResponse = await asyncGet({
        url: `${databaseUrl}/_users/_design/CARLI/_view/listUsersByEmail`
    });

    const users = JSON.parse(usersResponse.body).rows;
    const usersThatNeedRenaming = users
        .filter(user => {
            // if(user.id.indexOf("_design/") > -1)
            //     return false;
            if (user.key === null)
                return false;

            return user.key !== user.key.toLowerCase();
        })
        .map(user => user.value);

    return usersThatNeedRenaming;
}
