angular.module('vendor.offeringColorKey')
    .directive('offeringColorKey', function(){
        return {
            restrict: 'E',
            template: [
                        '<div id="offering-key">',
                        '    <div class="updated"><div class="box"></div><span>Updated Price</span></div>',
                        '    <div class="imported"><div class="box"></div><span>Last Year\'s Price</span></div>',
                        '    <div class="flagged"><div class="box"></div><span>Flagged Price</span></div>',
                        '</div>'
            ].join('')
        };
    });
