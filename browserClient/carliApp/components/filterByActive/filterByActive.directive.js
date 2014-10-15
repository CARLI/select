angular.module('carli.filterByActive')
    .directive('filterByActiveToggle', function() {
        return {
            restrict: 'E',
            transclude: true,
            templateUrl: 'carliApp/components/filterByActive/filterByActive.html',
            scope: { entityLabel: '=', activeFilterState: '=' },
            controller: filterByActiveToggleController
        };
    });

function filterByActiveToggleController($scope) {
    $scope.isShowActive = isShowActive;
    $scope.isShowInactive = isShowInactive;
    $scope.isShowAll = isShowAll;
    $scope.setShowActive = setShowActive;
    $scope.setShowInactive = setShowInactive;
    $scope.setShowAll = setShowAll;

    function isShowActive () {
        return $scope.activeFilterState == "Active";
    }
    function isShowInactive () {
        return $scope.activeFilterState == "Inactive";
    }
    function isShowAll () {
        return $scope.activeFilterState == "All";
    }
    function setShowActive () {
        $scope.activeFilterState = "Active";
    }
    function setShowInactive () {
        $scope.activeFilterState = "Inactive";
    }
    function setShowAll () {
        $scope.activeFilterState = "All";
    }
}
