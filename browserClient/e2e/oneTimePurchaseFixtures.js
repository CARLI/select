#!/usr/bin/env node

var uuid = require('node-uuid');



var lib1_uuid = uuid.v4();

var activeLibrary1 =  {"id": lib1_uuid, "type":"Library", "isActive":true,"fte": 1231,"name":lib1_uuid, "institutionYears":"2 Year", "institutionType":"Public", "contacts":[] };

module.exports = {
    activeLibrary1:activeLibrary1
};
