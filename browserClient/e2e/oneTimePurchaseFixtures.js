#!/usr/bin/env node

var uuid = require('node-uuid');



var lib1_uuid = uuid.v4();
var lib2_uuid = uuid.v4();
var lib3_uuid = uuid.v4();

var activeLibrary1 =  {"id": lib1_uuid, "type":"Library", "isActive":true,"fte": 1231,"name":lib1_uuid, "institutionYears":"2 Year", "institutionType":"Public", "contacts":[] };
var inactiveLibrary2 =  {"id": lib2_uuid, "type":"Library", "isActive":false,"fte": 31,"name":lib2_uuid, "institutionYears":"Other", "institutionType":"Private", "contacts":[] };
var activeLibrary3 =  {"id": lib3_uuid, "type":"Library", "isActive":true,"fte": 999,"name":lib3_uuid, "institutionYears":"4 Year", "institutionType":"Other", "contacts":[] };

module.exports = {
    activeLibrary1:activeLibrary1,
    inactiveLibrary2:inactiveLibrary2,
    activeLibrary3:activeLibrary3
};
