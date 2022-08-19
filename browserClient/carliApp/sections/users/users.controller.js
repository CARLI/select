angular.module('carli.sections.users')
.controller('userController', userController);

function userController( $sce, $location, userService, csvExportService, libraryService, vendorService ){
    var vm = this;
    vm.userIsReadOnly = userService.userIsReadOnly();
    vm.activeCycles = [];
    vm.afterUserSubmit = populateUserList;
    activate();
    vm.userType = $location.path().substring($location.path().lastIndexOf('/') + 1);

    function activate() {
        populateUserList();
    }

    function populateUserList() {
        setUserTypeLabel(vm.userType);

        vm.loadingPromise = userService.list().then(filterUsersByType);

        function filterUsersByType(userList){
            vm.userList = userList
                .filter(filterByRole)
                .filter(filterMasqueradingStaffFromNonStaffLists)
                .map(useFullNameForNameSearch);

            function filterByRole(user) {
                const userTypesForRole = {
                    staff: ['staff', 'readonly-staff'],
                    library: ['library'],
                    vendor: ['vendor']
                };
                let result = false;
                userTypesForRole[vm.userType].forEach(userTypeForRole => {
                    if(user.roles.indexOf(userTypeForRole) >= 0)
                        result = true;
                })
                return result;
            }
            function filterMasqueradingStaffFromNonStaffLists(user) {
                if (vm.userType === 'staff') {
                    return true;
                }
                var isAlsoStaff = user.roles.indexOf('staff') >= 0;
                return !isAlsoStaff;
            }
        }
    }

    function setUserTypeLabel(userType) {
        switch (userType) {
            case 'staff':
                vm.userTypeLabel = 'CARLI Staff';
                break;
            case 'vendor':
                vm.userTypeLabel = 'Vendor';
                break;
            case 'library':
                vm.userTypeLabel = 'Library';
                break;
        }
    }

    function useFullNameForNameSearch(user) {
        user.name = user.fullName;
        return user;
    }



    vm.userListColumns = [
        {
            label: "User",
            orderByProperty: 'fullName',
            contentFunction: function(user) {
                return $sce.trustAsHtml('<a href="user/' + user.email + '">' + user.fullName + '</a>');
            }
        },
        {
            label: "Email",
            orderByProperty: ['email'],
            contentFunction: function(user) {
                return $sce.trustAsHtml('<a href="mailto:' + user.email + '">' + user.email + '</a>');
            }
        }
    ];



    vm.exportUsersToCsv = function() {
        libraryService.list().then(libraries => {
            vendorService.list().then(vendors => {
                let users = vm.userList.map(user => {
                    user = flattenUserInformation(user);
                    user = mapLibraryInformationToUser(libraries, user);
                    user = mapVendorInformationToUser(vendors, user);
                    return user;
                });


                csvExportService.exportToCsv(users, ["fullName", "email", "libraryName", "vendorName", "role", "access", "active"]).then((csvString) => csvExportService.browserDownloadCsv(csvString, `CSV_EXPORT.csv`));
            })
        })
    }

    function flattenUserInformation(user) {

        user.role = user.roles[0];
        user.access = user.roles.indexOf("readonly") >= 0 || user.roles.indexOf("readonly-staff") >= 0 ? "read-only" : "read-write";

        user.active = user.isActive ? "active" : "inactive";

        return user;
    }

    function userIsStaff(user) {
        return user.roles.indexOf("staff") >= 0 || user.roles.indexOf("readonly-staff") >= 0;
    }

    function mapLibraryInformationToUser(libraries, user) {
        let clonedUser = Object.assign({}, user);

        let matchedLibrary = libraries.filter(library => library.id === clonedUser.library)[0];

        if(matchedLibrary && !userIsStaff(user)){
            clonedUser.libraryName = matchedLibrary.name;
        }

        return clonedUser;
    }

    function mapVendorInformationToUser(vendors, user) {
        let clonedUser = Object.assign({}, user);

        let matchedVendor = vendors.filter(vendor => vendor.id === clonedUser.vendor)[0];

        if(matchedVendor && !userIsStaff(user)){
            clonedUser.vendorName = matchedVendor.name;
        }

        return clonedUser;
    }
}

