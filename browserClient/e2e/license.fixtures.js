var uuid = require('node-uuid');

var vendor1_uuid = uuid.v4();
var vendor2_uuid = uuid.v4();

var vendor1 = {
    id: vendor1_uuid,
    name: vendor1_uuid
};
var vendor2 = {
    id: vendor2_uuid,
    name: vendor2_uuid
};

module.exports = {
    vendor1: vendor1,
    vendor2: vendor2
};