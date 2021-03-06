angular.module('vendor.quickPricing')
    .controller('quickPricingLibrarySelectorController', quickPricingLibrarySelectorController);

function quickPricingLibrarySelectorController($scope) {
    var vm = this;
    vm.filters = {};

    vm.selectBy = 'filter';
    vm.resetFteFilter = resetFteFilter;
    vm.debugApplyFilters = applyFilters;

    activate();

    function activate() {
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

        $scope.$watch(getFilters, applyFilters, true);
    }

    function getFilters() {
        return vm.filters;
    }
    function applyFilters() {
        if (!vm.libraries) {
            return;
        }
        var skipFteFilter = !shouldFilterByFte();
        var skipYearFilter = !shouldFilterByYear();
        var skipTypeFilter = !shouldFilterByType();

        if (skipFteFilter && skipYearFilter && skipTypeFilter) {
            selectAllLibraries();
            return;
        }

        vm.libraries.forEach(function(library) {
            //noinspection OverlyComplexBooleanExpressionJS
            vm.selectedLibraryIds[library.id] =
                (skipFteFilter || filterByFte(library)) &&
                (skipYearFilter || filterByYear(library)) &&
                (skipTypeFilter || filterByType(library));
        });
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
