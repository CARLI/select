angular.module('carli.renderOffering')
    .directive('renderOffering', renderOfferingDirective);

var offeringTemplatePromise;
var editOfferingHandlerAttached;
var commentHandlerAttached;
var offeringsById = {};

function renderOfferingDirective($http, $q, $filter, alertService, editOfferingService, errorHandler, offeringService, productService, userService){
    registerHandlebarsHelpers();

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
                offering.product.displayName = productService.getProductDisplayName(offering.product);
                copyVendorCommentsToPricing(offering);

                var columns = translateColumnArrayToObject(scope.columns);

                getOfferingTemplate().then(function (template) {
                    var values = {
                        thisYear: scope.cycle.year,
                        lastYear: lastYear,
                        suPricingThisYear: pricingThisYear(),
                        selectedLastYear: selectedLastYear(),
                        pricingLastYear: pricingLastYear(),
                        offering: offering,
                        offeringIsFlagged: offeringService.getFlaggedState(offering, scope.cycle),
                        offeringWasFlaggedByCarli: (offering.flagged === true),
                        offeringWasUnFlaggedByCarli: (offering.flagged === false),
                        offeringFlagTitle: offeringFlagTitle(),
                        userIsReadOnly: userService.userIsReadOnly(),
                        columns: columns,
                        selectionColumn: (columns.selection || columns.oneTimePurchaseSelection)
                    };
                    element.html( template(values) );
                });

                function pricingThisYear(){
                    return $filter('orderBy')(offering.pricing.su, 'users');
                }

                function selectedLastYear(){
                    if ( offering.history && offering.history[lastYear] ){
                        return offering.history[lastYear].selection;
                    }
                    return false;
                }

                function pricingLastYear(){
                    if ( offering.history && offering.history[lastYear] ){
                        offering.history[lastYear].pricing.su = $filter('orderBy')(offering.history[lastYear].pricing.su, 'users');
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

                function offeringFlagTitle() {
                    if (offering.flaggedReason) {
                        return offering.flaggedReason[0];
                    }
                    if (offering.flagged === false) {
                        return 'Flag manually cleared by CARLI staff';
                    }
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

    function currency( number ) {
        return $filter('currency')(number);
    }

    function displayLabel( display ) {
        var offeringDisplayLabels = offeringService.getOfferingDisplayLabels();
        return offeringDisplayLabels[display];
    }

    function formatSelectionUsers( users ) {
        return users === offeringService.siteLicenseSelectionUsers ? 'Site License' : users + usersLabel(users);

        function usersLabel(users) {
            return users === 1 ? ' User' : ' Users';
        }
    }

    function fundingIndicator(offering) {
        var indicator = '';

        if (offering.funding) {
            if (offering.funding.fundedByPercentage && offering.funding.fundedPercent > 0) {
                return '('+ offering.funding.fundedPercent +'% Funded)';
            }
            if (!offering.funding.fundedByPercentage && offering.funding.fundedPrice > 0) {
                return '(Funded)';
            }
        }
        return indicator;
    }
    function historicalFundingIndicator(offering) {
        var indicator = '';
        var lastYear = offering.cycle.year - 1;

        if (offering.history && offering.history[lastYear]) {
            var funding = offering.history[lastYear].funding;

            if (funding) {
                if (funding.fundedByPercentage && funding.fundedPercent > 0) {
                    return '('+ funding.fundedPercent +'% Funded)';
                }
                if (!funding.fundedByPercentage && funding.fundedPrice > 0) {
                    return '(Funded)';
                }
            }
        }
        return indicator;
    }

    function fundedSelectionPrice(offering) {
        return currency( offeringService.getFundedSelectionPrice(offering) );
    }

    function fullSelectionPrice(offering) {
        return currency( offeringService.getFullSelectionPrice(offering) );
    }

    function fundedSiteLicensePrice(offering) {
        return currency( offeringService.getFundedSiteLicensePrice(offering) );
    }

    function getUpdatedPricingClass(offering) {
        return offering.siteLicensePriceUpdated ? 'updated' : 'not-updated';
    }

    function fundedLastYearsSiteLicensePrice(offering) {
        var lastYear = offering.cycle.year - 1;
        return currency( offeringService.getHistoricalFundedSiteLicensePrice(offering, lastYear) );
    }

    function mediumDate(dateString) {
        return $filter('date')(dateString, 'mediumDate');
    }

    function registerHandlebarsHelpers() {
        Handlebars.registerHelper('currency', currency);
        Handlebars.registerHelper('displayLabel', displayLabel);
        Handlebars.registerHelper('formatSelectionUsers', formatSelectionUsers);
        Handlebars.registerHelper('fullSelectionPrice', fullSelectionPrice);
        Handlebars.registerHelper('fundingIndicator', fundingIndicator);
        Handlebars.registerHelper('historicalFundingIndicator', historicalFundingIndicator);
        Handlebars.registerHelper('fundedSelectionPrice', fundedSelectionPrice);
        Handlebars.registerHelper('fundedSiteLicensePrice', fundedSiteLicensePrice);
        Handlebars.registerHelper('fundedLastYearsSiteLicensePrice', fundedLastYearsSiteLicensePrice);
        Handlebars.registerHelper('mediumDate', mediumDate);
        Handlebars.registerHelper('getUpdatedPricingClass', getUpdatedPricingClass);
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

