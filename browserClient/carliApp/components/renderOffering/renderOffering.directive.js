angular.module('carli.renderOffering')
    .directive('renderOffering', renderOfferingDirective);

var source = '<div class="column library"> <div class="library-info"> <span class="name">{{ library.name }}</span> <div> <span class="key">Size (FTE):</span><span class="value">{{ library.fte }}</span> </div> <div> <span class="key">Institution:</span><span class="value">{{ library.institutionYears }}</span> </div> <div> <span class="key">Type:</span><span class="value">{{ library.institutionType }}</span> </div> </div> <button type="button" class="carli-button edit">Edit <span class="fa fa-pencil-square-o "></span></button> <button type="button" style="display: none;" class="carli-button save"">Save <span class="fa fa-floppy-o"></span></button> </div> <div class="column library-view"> <div class="display"> <strong class="purple">{{ display }}</strong> </div> <div class="comments"> <div class="column internal-comments"> <label for="internal-comments">Internal Comments</label> <textarea id="internal-comments" readonly="true">{{ internalComments }}</textarea> </div> <div class="column library-comments"> <label for="library-comments">Comments for Libraries</label> <textarea id="library-comments" readonly="true">{{ libraryComments }}</textarea> </div> </div> </div> <div class="column selected-last-year"> {{#if history}} <span class="fa fa-star"></fa> {{/if}} </div> <div class="column site-license-price"> <div class="site-pricing single-column"> <div class="column"> <div class="header"><strong>{{ vm.year }}</strong> Price</div> <div class="row"> {{ vm.pricing.site }} </div> </div> </div> <div class="su-pricing single-column"> <div class="header"><strong>Simultaneous User Price</strong></div> <div class="column"> <div class="edit-su-pricing"> <table> <thead> <tr> <th><strong>TODO</strong> Price</th> <th>User(s)</th> </tr> </thead> <tbody> {{#each pricing.su }} <tr> <td>{{ price }}</td> <td>{{ users }}</td> </tr>{{/each}}</tbody> </table> </div> </div> </div> </div> <div class="column selection"> <label for="{{ id }}_selection" class="sr-only">Library Selection</label> {{#if selection }} <div class="selection-display"> <div class="users"><span class="label">Selection:</span> {{ selection.users }}</div> <div class="price"><span class="label">Price:</span> {{ selection.price }}</div> </div> {{/if}} </div> <div class="column vendor-invoice"> <div class="label">Vendor Price</div> {{ invoice.price }} <div class="label">Invoice #</div> {{ invoice.number }} </div>';
var template = Handlebars.compile(source);

function renderOfferingDirective( $rootScope, uuid ) {
    return {
        restrict: 'E',
        scope: {
            offering: '='
        },
        link: function postLink(scope, element, attrs) {

            function render(offerings){
                if ( offerings ){
                    element.html( template(offerings) );
                }
            }

            scope.$watch('offering',render);
        }
    };
}

