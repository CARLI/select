const cycleRepository = require('../../CARLI/Entity/CycleRepository');
const libraryRepository = require('../../CARLI/Entity/LibraryRepository');
const offeringRepository = require('../../CARLI/Entity/OfferingRepository');
const userRepository = require('../../CARLI/Entity/UserRepository');

const Q = require('q');

function listLibraries() {
    return libraryRepository.list()
        .then(translateLibraries);

    function translateLibraries( libraries ) {
        return libraries.map(translateLibrary);
    }

    function translateLibrary( library ){
        var result = {
            id: library.crmId,
            name: library.name,
            fte: library.fte,
            institutionType: library.institutionType,
            institutionYears: library.institutionYears,
            membershipLevel: library.membershipLevel
        };


        if ('isIshareMember' in library)
            result.isIshareMember = !!library.isIshareMember;
        else
            result.isIshareMember = false;

        if ('isActive' in library)
            result.isActive = !!library.isActive;
        else
            result.isActive = false;


        return result;
    }
}

function listLibraryUsers() {
    return userRepository.list()
        .then(filterOnlyLibraryUsers)
        .then(translateLibraryUsers);

    function filterOnlyLibraryUsers(users) {
        return users.filter((u) => {
            return u.hasOwnProperty("library") &&
                u.roles.indexOf("library") >= 0;
        })
    }

    function translateLibraryUsers(users) {
        return users.map(translateLibraryUser)
    }

    function translateLibraryUser(user) {
        return {
            email: user.email,
            isActive: user.isActive,
            fullName: user.fullName,
            library: user.library,
        };
    }
}

function listCycles() {
    return cycleRepository.list()
        .then(translateCycles);

    function translateCycles(cycles) {
        return cycles.map(translateCycle)
    }

    function translateCycle(cycle) {
        return {
            id: cycle.id,
            idalId: cycle.idalId,
            name: cycle.name,
            cycleType: cycle.cycleType,
            year: cycle.year,
            isArchived: cycle.isArchived,
            startDateForSelections: cycle.startDateForSelections,
            endDateForSelections: cycle.endDateForSelections,
            productsAvailableDate: cycle.productsAvailableDate,
            databaseName: cycle.databaseName
        };
    }
}

function getSubscriptionData(cycle) {
    if (typeof cycle === 'undefined' || !cycle)
        throw "Invalid cycle database name: Use /cm/list-cycles to list valid cycles";

    var uniqueKeys = [];

    return cycleRepository.load(cycle)
        .then(offeringRepository.listOfferingsWithSelectionsUnexpanded)
        .then(translateOfferings)
        .then((foo) => {
            console.log(uniqueKeys);
            return foo;
        });

    function translateOfferings(offerings) {
        return offerings.map(translateOffering);
    }

    function translateOffering(offering) {
        if (offering.hasOwnProperty("selection")) {
            const k = offering.selection.users;
            if (uniqueKeys.indexOf(k) < 0)
                uniqueKeys.push(k);
        }
        return {
            product: offering.product,
            vendor: offering.vendorId,
            library: offering.library,
            selection: offering.selection,
            pricing: offering.pricing,
        };
    }

    function deleteStuff(results) {
        return results.map(row => {
            delete row._id;
            delete row._rev;
            delete row.display;
            delete row.libraryComments;
            delete row.vendorComments;
            delete row.internalComments;
            delete row.cycle;
            delete row.history;
            delete row["$$hashKey"];
            return row;
        });
    }
}

module.exports = {
    listLibraries: listLibraries,
    listLibraryUsers: listLibraryUsers,
    listCycles: listCycles,
    getSubscriptionData: getSubscriptionData
};