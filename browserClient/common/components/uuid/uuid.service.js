const uuid = require('uuid/v4');

angular.module('common.uuid')
    .factory('uuid', function() {
        return {
            generateCssId: function () {
                return uuid();
            }
        };
    });
