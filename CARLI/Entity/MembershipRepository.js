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

MembershipRepository.getMembershipDuesAsOfferings = function (membershipData) {
    var libraryIds = Object.keys(membershipData.data);
    var year = membershipData.year;

    return libraryIds.map(function convertMembershipDuesToOffering(libraryId) {
        var dues = membershipData.data[libraryId];
        return {
            cycle: {
                year: year
            },
            library: {
                id: libraryId
            },
            pricing: {
                ishare: dues.ishare,
                membership: dues.membership
            }
        }
    });
};

module.exports = MembershipRepository;