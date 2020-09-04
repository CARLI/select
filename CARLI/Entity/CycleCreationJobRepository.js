var Entity = require('../Entity');
var config = require('../../config');
var StoreOptions = config.storeOptions;
var Store = require('../Store');
var StoreModule = require('../Store/CouchDb/Store');

var couchUtils = require('../Store/CouchDb/Utils')(StoreOptions);

var baseRepository = Entity('CycleCreationJob');

baseRepository.setStore(Store(StoreModule(StoreOptions)));

module.exports = baseRepository;
