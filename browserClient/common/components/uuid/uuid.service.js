angular.module('common.uuid')
    .factory('uuid', function() {
        var uniqueId = 0;

        return {
            generateCssId: function () {
                return uniqueId++;
            }
        };
    });
