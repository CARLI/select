angular.module('carli.renderOffering')
    .directive('renderOffering', renderOfferingDirective);

var offeringTemplatePromise;
var editOfferingHandlerAttached;
var flagOfferingHandlerAttached;
var commentHandlerAttached;
var offeringsById = {};

function renderOfferingDirective($http, $q, $filter, alertService, editOfferingService, errorHandler, offeringService, productService){
    registerHandlebarsHelpers();

    var flagActionInProgress = {};

    return {
        restrict: 'E',
        scope: {
            offering: '=',
            cycle: '=',
            columns: '='
        },
        template: '<div id="rendered-offering-{{ offeringId }}"></div>',
        link: function postLink(scope, element, attrs) {
            attachEditButtonHandlers();
            attachFlagButtonHandlers();
            attachCommentHandlers();

            scope.$watch('offering',renderOfferingWhenReady, true);

            function renderOfferingWhenReady(newValue, oldValue) {
                if (newValue) {
                    offeringsById[newValue.id] = newValue;
                    scope.offeringId = newValue.id;

                    render(newValue);
                }
            }

            function render(offering){
                var lastYear = scope.cycle.year - 1;
                offering.pricing.su = $filter('orderBy')(offering.pricing.su, 'users');
                offering.product.displayName = productService.getProductDisplayName(offering.product);
                copyVendorCommentsToPricing(offering);

                getOfferingTemplate().then(function (template) {
                    offering.flagged = offeringService.getFlaggedState(offering, scope.cycle);

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

                function copyVendorCommentsToPricing(offering) {
                    if (!offering.vendorComments || !offering.vendorComments.su) {
                        return;
                    }
                    offering.vendorComments.su.forEach(function (suComment) {
                        offering.pricing.su.forEach(function (suPricing) {
                            if (suPricing.users == suComment.users) {
                                suPricing.comment = suComment.comment;
                            }
                        });
                    });
                }
            }

            function getOfferingTemplate() {
                if (!offeringTemplatePromise) {
                    offeringTemplatePromise = $q.defer();

                    $http.get('/carliApp/components/renderOffering/renderOffering.handlebars').then(function (response) {
                        var source = response.data;
                        var offeringTemplate = Handlebars.compile(source, {});
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

                    if ( flagActionInProgress[offeringId] ){
                        return;
                    }

                    disableFlagAction(offeringId);

                    scope.$apply(function() {
                        editOfferingService.toggleOfferingUserFlaggedState(offeringId)
                            .then(alertSuccess, errorHandler)
                            .then(offeringService.load)
                            .then(updateFlagCssClass);
                    });

                    function alertSuccess(offeringId) {
                        alertService.putAlert('Offering updated', {severity: 'success'});
                        return offeringId;
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

                        enableFlagAction(updatedOffering.id);

                        return updatedOffering;
                    }
                }
            }

            function attachCommentHandlers() {
                if (commentHandlerAttached){
                    return;
                }

                commentHandlerAttached = true;
                $('body').on('click', '.comment-marker', showComment);

                function showComment() {
                    var $this = $(this);

                    var type = $this.data('comment-type');
                    var offeringId = $this.data('offering-id');
                    var offering = offeringsById[offeringId];

                    if (type === 'site') {
                        populateAndShowCommentModal(offering.vendorComments.site);
                    } else if (type === 'su') {
                        var users = $this.data('users');
                        offering.vendorComments.su.forEach(function (suComment) {
                            if (suComment.users == users) {
                                populateAndShowCommentModal(suComment.comment);
                            }
                        });
                    }

                    function populateAndShowCommentModal(comment) {
                        scope.$apply(function() {
                            $('#vendor-comments .comment-text').html(comment);
                            $('#vendor-comments').modal();
                        });
                    }
                }
            }
        }
    };


    function disableFlagAction( offeringId ){
        flagActionInProgress[offeringId] = true;
    }

    function enableFlagAction( offeringId ){
        flagActionInProgress[offeringId] = false;
    }

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

