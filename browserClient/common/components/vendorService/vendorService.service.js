angular.module('common.vendorService')
    .service('vendorService', vendorService);

function vendorService( CarliModules, $q, errorHandler ) {

    var vendorModule = CarliModules.Vendor;

    return {
        list:   function() { return $q.when( vendorModule.list()).catch(errorHandler); },
        listActive:   function() { return $q.when( vendorModule.listActive()).catch(errorHandler); },
        create: function() { return $q.when( vendorModule.create.apply(this, arguments) ); },
        update: function() { return $q.when( vendorModule.update.apply(this, arguments) ); },
        load:   function() { return $q.when( vendorModule.load.apply(this, arguments) ).catch(errorHandler); },
        getVendorsById: function(ids) {
            return $q.when( vendorModule.getVendorsById(ids))
                .catch(errorHandler);
        }
    };
}
