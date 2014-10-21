/**
 * @name FilterByActive Filter
 * @desc This function filters a list based on the active state of the items. 
 * It works in conjunction with the `filterByActiveToggle` directive to limit
 * which items are shown. 
 */
angular.module('carli.filterByActive')
    .filter('filterByActive', filterByActive);

    function filterByActive($filter) {
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
    }
