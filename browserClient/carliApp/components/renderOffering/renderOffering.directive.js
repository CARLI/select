angular.module('carli.renderOffering')
    .directive('renderOffering', renderOfferingDirective);

var offeringTemplatePromise;

function renderOfferingDirective( $http, $q ) {
    return {
        restrict: 'E',
        scope: {
            offering: '='
        },
        link: function postLink(scope, element, attrs) {
            scope.$watch('offering',renderOfferingWhenReady);

            function renderOfferingWhenReady(newValue, oldValue) {
                if (newValue) {
                    render(newValue);
                }
            }

            function render(offering){
                getOfferingTemplate().then(function (template) {
                    element.html( template({ offering: offering }) );
                });
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
        }
    };
}

