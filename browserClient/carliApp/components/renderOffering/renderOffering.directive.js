angular.module('carli.renderOffering')
    .directive('renderOffering', renderOfferingDirective);

var offeringTemplatePromise;
var editOfferingHandlerAttached;
var flagOfferingHandlerAttached;

function renderOfferingDirective( $http, $q, $filter, alertService, offeringService, editOfferingService, productService ) {
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
            attachFlagButtonHandlers();

            scope.$watch('offering',renderOfferingWhenReady, true);

            function renderOfferingWhenReady(newValue, oldValue) {
                if (newValue) {
                    render(newValue);
                }
            }

            function render(offering){
                var lastYear = scope.cycle.year - 1;
                offering.pricing.su = $filter('orderBy')(offering.pricing.su, 'users');
                offering.product.displayName = productService.getProductDisplayName(offering.product);

                getOfferingTemplate().then(function (template) {
                    offering.flagged = offeringService.getFlaggedState(offering);

                    var values = {
                        thisYear: scope.cycle.year,
                        lastYear: lastYear,
                        selectedLastYear: selectedLastYear(),
                        pricingLastYear: pricingLastYear(),
                        offering: offering,
                        columns: translateColumnArrayToObject(scope.columns)
                    };
                    element.html( template(values) );

                });

                function selectedLastYear(){
                    if ( offering.history && offering.history[lastYear] ){
                        return offering.history[lastYear].selection;
                    }
                    return false;
                }

                function pricingLastYear(){
                    if ( offering.history && offering.history[lastYear] ){
                        return offering.history[lastYear].pricing;
                    }
                    return {};
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
                        editOfferingService.sendOfferingEditableMessage(offeringId);
                    });
                }
            }

            function attachFlagButtonHandlers() {
                if (flagOfferingHandlerAttached){
                    return;
                }

                flagOfferingHandlerAttached = true;
                $('body').on('click', 'render-offering .column.flag', flagOffering);

                function flagOffering() {
                    var offeringId = $(this).data('offering-id');

                    scope.$apply(function() {
                        editOfferingService.toggleOfferingUserFlaggedState(offeringId)
                            .then(alertSuccess, alertError)
                            .then(offeringService.load)
                            .then(updateFlagCssClass);
                    });

                    function alertSuccess(offeringId) {
                        alertService.putAlert('Offering updated', {severity: 'success'});
                        return offeringId;
                    }
                    function alertError(err) {
                        alertService.putAlert(err, {severity: 'danger'});
                        console.log('failed', err);
                    }

                    function updateFlagCssClass( updatedOffering ){
                        //Do not use scope.offering here - it is always the offering of the first instance of this directive!
                        var flag = $('.flag[data-offering-id='+updatedOffering.id+'] > .fa');
                        var offeringShouldBeFlagged = offeringService.getFlaggedState(updatedOffering);

                        if ( offeringShouldBeFlagged ){
                            flag.removeClass('fa-flag-o').addClass('fa-flag');
                        }
                        else {
                            flag.removeClass('fa-flag').addClass('fa-flag-o');
                        }

                        return updatedOffering;
                    }
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

