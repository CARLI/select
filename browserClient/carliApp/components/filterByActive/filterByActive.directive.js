angular.module('carli.filterByActive')
    .directive('filterByActive', function() {
        return {
            restrict: 'E',
            transclude: true,
            templateUrl: 'carliApp/components/filterByActive/filterByActive.html',
            scope: { entityLabel: '=' },
            controllerAs: 'filter',
            controller: filterByActiveController
        };
    });


function filterByActiveController($scope) {
    var thisController = this;
    this.filterValue = "Active";

    this.isShowActive = isShowActive;
    this.isShowInactive = isShowInactive;
    this.isShowAll = isShowAll;
    this.setShowActive = setShowActive;
    this.setShowInactive = setShowInactive;
    this.setShowAll = setShowAll;
    $scope.$parent.filterByActive = filterByActive;

    function filterByActive (value) {
        switch (thisController.filterValue) {
            case "Active":
                return value.isActive;
            case "Inactive":
                return !value.isActive;
            default:
                return true;
        }
    }
    function isShowActive () {
        return this.filterValue == "Active";
    }
    function isShowInactive () {
        return this.filterValue == "Inactive";
    }
    function isShowAll () {
        return this.filterValue == "All";
    }
    function setShowActive () {
        this.filterValue = "Active";
    }
    function setShowInactive () {
        this.filterValue = "Inactive";
    }
    function setShowAll () {
        this.filterValue = "All";
    }
}