angular.module('carli.mockCycleService', [])
    .factory('mockCycleService', function mockCycleService($q) {

        return {
            load: function(){
                var deferred = $q.defer();

                deferred.resolve({
                    id: '',
                    cycleType: 'Fiscal Year'
                });

                return deferred.promise;
            },
            setCurrentCycle: function(){

            },
            getCurrentCycle: function(){
                return {};
            },
            listActiveCycles: function(){
                var deferred = $q.defer();

                deferred.resolve([]);

                return deferred.promise;
            }
        };
    });
