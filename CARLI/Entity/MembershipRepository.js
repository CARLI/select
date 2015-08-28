var Entity = require('../Entity');
var config = require('../../config');
var StoreOptions = config.storeOptions;
var Store = require('../Store');
var StoreModule = require('../Store/CouchDb/Store');

var couchUtils = require('../Store/CouchDb/Utils')(StoreOptions);

var MembershipRepository = Entity('Membership');
MembershipRepository.setStore(Store(StoreModule(StoreOptions)));

MembershipRepository.loadDataForYear = function (year) {
    return couchUtils.getCouchViewResultValues(StoreOptions.couchDbName, 'membershipByYear', year);
};

module.exports = MembershipRepository;