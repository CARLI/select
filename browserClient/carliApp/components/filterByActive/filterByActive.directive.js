angular.module('carli.filterByActive')
    .directive('filterByActiveToggle', filterByActiveToggle);

    function filterByActiveToggle() {
        return {
            restrict: 'E',
            transclude: true,
            templateUrl: 'carliApp/components/filterByActive/filterByActive.html',
            scope: {
                entityLabel: '=',
                activeFilterState: '='
            },
            link: filterByActiveTogglePostLink
        };
    }

function filterByActiveTogglePostLink(scope, element) {
    scope.isShowActive = isShowActive;
    scope.isShowInactive = isShowInactive;
    scope.isShowAll = isShowAll;
    scope.setShowActive = setShowActive;
    scope.setShowInactive = setShowInactive;
    scope.setShowAll = setShowAll;

    makeKeyboardAccessible();

    function isShowActive () {
        return scope.activeFilterState == "Active";
    }
    function isShowInactive () {
        return scope.activeFilterState == "Inactive";
    }
    function isShowAll () {
        return scope.activeFilterState == "All";
    }
    function setShowActive () {
        scope.activeFilterState = "Active";
    }
    function setShowInactive () {
        scope.activeFilterState = "Inactive";
    }
    function setShowAll () {
        scope.activeFilterState = "All";
    }

    function makeKeyboardAccessible() {
        // Must use keydown to prevent scrolling the page when toggling the checkbox.
        element.find('#filter-active .fa').on('keydown', onSpaceBarApply(setShowActive));
        element.find('#filter-inactive .fa').on('keydown', onSpaceBarApply(setShowInactive));
        element.find('#filter-all .fa').on('keydown', onSpaceBarApply(setShowAll));
    }
    function onSpaceBarApply(callback) {
        var keyCode = { SPACE: 32 };

        return function (e) {
            if (e.keyCode == keyCode.SPACE) {
                preventScrolling(e);
                scope.$apply(callback);
            }
        };
    }
    function preventScrolling(e) {
        e.preventDefault();
    }
}
