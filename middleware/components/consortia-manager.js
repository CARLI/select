const libraryRepository = require('../../CARLI/Entity/LibraryRepository.js');
const userRepository = require('../../CARLI/Entity/UserRepository.js');

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

module.exports = {
    listLibraries: listLibraries,
    listLibraryUsers: listLibraryUsers
};