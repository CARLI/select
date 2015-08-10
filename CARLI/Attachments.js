var config = require('../config');
var Attachments = require('./Store/CouchDb/Attachments');

var attachmentsModule = Attachments(config.storeOptions);

module.exports = attachmentsModule;
