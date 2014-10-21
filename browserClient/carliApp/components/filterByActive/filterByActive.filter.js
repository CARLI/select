angular.module('carli.filterByActive')
    .filter('filterByActive', function ($filter) {
        return function (values, activeFilterState) {
            return $filter('filter')(values, function (value) {
                switch (activeFilterState) {
                    case "Active":
                        return value.isActive;
                    case "Inactive":
                        return !value.isActive;
                    default:
                        return true;
                }
            });
        };
    });