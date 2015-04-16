angular.module('vendor.quickPricing')
    .controller('quickPricingLibrarySelectorController', quickPricingLibrarySelectorController);

function quickPricingLibrarySelectorController($scope) {
    var vm = this;

    vm.filters = {
        fte: {
            lowerBound: null,
            upperBound: null
        },
        institutionYears: {
            fourYear: false,
            twoYear: false,
            other: false
        },
        institutionType: {
            private: false,
            public: false,
            other: false
        }
    };

    vm.selectedLibraryCount = selectedLibraryCount;
    vm.totalLibraryCount = totalLibraryCount;
    vm.resetFteFilter = resetFteFilter;
    vm.debugApplyFilters = applyFilters;

    function selectedLibraryCount() {
        var selectedIdsArray = Object.keys(vm.selectedLibraryIds).filter(function (libraryId) {
            return vm.selectedLibraryIds[libraryId];
        });
        return selectedIdsArray.length;
    }
    function totalLibraryCount() {
        return Object.keys(vm.selectedLibraryIds).length;
    }

    function applyFilters() {
        if (!vm.libraries) {
            return;
        }
        console.time('applyFilters');

        var skipFteFilter = !shouldFilterByFte();
        var skipYearFilter = !shouldFilterByYear();
        var skipTypeFilter = !shouldFilterByType();

        console.log('applying filters');
        console.log('  -- by FTE: ', !skipFteFilter);
        console.log('  -- by Year: ', !skipYearFilter);
        console.log('  -- by Type: ', !skipTypeFilter);

        if (skipFteFilter && skipYearFilter && skipTypeFilter) {
            selectAllLibraries();
            console.timeEnd('applyFilters');
            return;
        }

        vm.libraries.forEach(function(library) {
            //noinspection OverlyComplexBooleanExpressionJS
            vm.selectedLibraryIds[library.id] =
                (skipFteFilter || filterByFte(library)) &&
                (skipYearFilter || filterByYear(library)) &&
                (skipTypeFilter || filterByType(library));
        });

        console.timeEnd('applyFilters');
    }

    function selectAllLibraries() {
        vm.libraries.forEach(function(library) {
            vm.selectedLibraryIds[library.id] = true;
        });
    }

    function shouldFilterByFte() {
        return !!(vm.filters.fte.lowerBound || vm.filters.fte.upperBound);
    }
    function filterByFte(library) {
        if (!library.fte) {
            library.fte = 0;
        }

        var lowerBound = parseInt(vm.filters.fte.lowerBound, 10) || 0;
        var upperBound = parseInt(vm.filters.fte.upperBound, 10) || Infinity;

        return !(library.fte < lowerBound || library.fte > upperBound);
    }
    function resetFteFilter() {
        vm.filters.fte.lowerBound = null;
        vm.filters.fte.upperBound = null;
    }

    function shouldFilterByYear() {
        var selection = vm.filters.institutionYears;
        /* If everything is checked *or* nothing is checked, then don't need to filter on this property at all */
        return !(selection.fourYear == selection.twoYear && selection.twoYear == selection.other);
    }
    function filterByYear(library) {
        var selection = vm.filters.institutionYears;

        //noinspection OverlyComplexBooleanExpressionJS
        return (library.institutionYears == '4 Year' && selection.fourYear) ||
            (library.institutionYears == '2 Year' && selection.twoYear) ||
            (library.institutionYears == 'Other' && selection.other);
    }

    function shouldFilterByType() {
        var selection = vm.filters.institutionType;
        /* If everything is checked *or* nothing is checked, then don't need to filter on this property at all */
        return !(selection.private == selection.public && selection.public == selection.other);
    }
    function filterByType(library) {
        var selection = vm.filters.institutionType;

        //noinspection OverlyComplexBooleanExpressionJS
        return (library.institutionType == 'Public' && selection.public) ||
            (library.institutionType == 'Private' && selection.private) ||
            (library.institutionType == 'Other' && selection.other);
    }
}
