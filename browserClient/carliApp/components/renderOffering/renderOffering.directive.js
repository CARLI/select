angular.module('carli.renderOffering')
    .directive('renderOffering', renderOfferingDirective);

var offeringTemplatePromise;
var editOfferingHandlerAttached;

function renderOfferingDirective( $http, $q, $filter, offeringService, editOfferingService ) {
    registerHandlebarsHelpers();

    return {
        restrict: 'E',
        scope: {
            offering: '=',
            cycle: '=',
            columns: '='
        },
        link: function postLink(scope, element, attrs) {
            attachEditButtonHandlers();

            scope.$watch('offering',renderOfferingWhenReady, true);

            function renderOfferingWhenReady(newValue, oldValue) {
                if (newValue) {
                    render(newValue);
                }
            }

            function render(offering){
                var lastYear = scope.cycle.year - 1;
                offering.pricing.su = $filter('orderBy')(offering.pricing.su, 'users');

                getOfferingTemplate().then(function (template) {
                    var values = {
                        thisYear: scope.cycle.year,
                        lastYear: lastYear,
                        selectedLastYear: selectedLastYear(),
                        offering: offering,
                        columns: translateColumnArrayToObject(scope.columns)
                    };
                    element.html( template(values) );

                });

                function selectedLastYear(){
                    if ( offering.history && offering.history[lastYear] ){
                        return offering.history[lastYear].selection;
                    }
                }
            }

            function getOfferingTemplate() {
                if (!offeringTemplatePromise) {
                    offeringTemplatePromise = $q.defer();

                    $http.get('/carliApp/components/renderOffering/renderOffering.handlebars').then(function (response) {
                        var source = response.data;
                        var offeringTemplate = Handlebars.compile(source);
                        offeringTemplatePromise.resolve(offeringTemplate);
                    });
                }
                return offeringTemplatePromise.promise;
            }

            function attachEditButtonHandlers() {
                if (editOfferingHandlerAttached){
                    return;
                }

                editOfferingHandlerAttached = true;
                $('body').on('click', '.carli-button.edit', editOffering);

                function editOffering() {
                    var offeringId = $(this).data('offering-id');

                    scope.$apply(function() {
                        editOfferingService.setCurrentOffering(offeringId);
                    });
                }
            }
        }
    };

    function currency( number ) {
        return $filter('currency')(number);
    }

    function displayLabel( display ) {
        var offeringDisplayLabels = offeringService.getOfferingDisplayLabels();
        return offeringDisplayLabels[display];
    }

    function formatSelection( users ) {
        return users === 'site' ? 'Site' : users + usersLabel(users);

        function usersLabel(users) {
            return users === 1 ? ' User' : ' Users';
        }
    }


    function registerHandlebarsHelpers() {
        Handlebars.registerHelper('currency', currency);
        Handlebars.registerHelper('displayLabel', displayLabel);
        Handlebars.registerHelper('formatSelection', formatSelection);
    }

    function translateColumnArrayToObject( columns ){
        var hash = {};

        columns.forEach(function(column){
            var columnName = column.replace(/-/g, '_');
            hash[columnName] = true;
        });

        return hash;
    }
}

