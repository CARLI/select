angular.module('carli.mockLibraryService', [])
    .factory('mockLibraryService', function mockLibraryService($q) {

        var mockLibraryList = [];

        return {
            createOrUpdate: 'neither',
            setTestData: function (data) {
                mockLibraryList = data;
            },
            list: function () {
                var deferred = $q.defer();
                deferred.resolve([]);
                return deferred.promise;
            },
            create: function () {
                var deferred = $q.defer();
                this.createOrUpdate = 'create';
                deferred.resolve();
                return deferred.promise;
            },
            update: function () {
                var deferred = $q.defer();
                this.createOrUpdate = 'update';
                deferred.resolve();
                return deferred.promise;
            },
            load: function () {
                var deferred = $q.defer();
                deferred.resolve( mockLibraryList[0] );
                return deferred.promise;
            },
            getInstitutionYearsOptions: function(){ return []; },
            getInstitutionTypeOptions: function(){ return []; },
            getMembershipLevelOptions: function(){ return []; }
        };
    });