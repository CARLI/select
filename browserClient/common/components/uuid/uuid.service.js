angular.module('common.uuid')
    .factory('uuid', function() {
        var uniqueId = 1000000;

        return {
            generateCssId: function () {
                return uniqueId++;
            }
        };
    });
