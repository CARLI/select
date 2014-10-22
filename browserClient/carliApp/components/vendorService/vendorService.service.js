angular.module('carli.vendorService')
    .service('vendorService', vendorService);

function vendorService( CarliModules ) {

    var vendorModule = CarliModules.Vendor;

    var vendorStore = CarliModules.Store( CarliModules.MemoryStore );

    vendorModule.setStore( vendorStore );

    return {
        list: vendorModule.list,
        create: vendorModule.create,
        update: vendorModule.update,
        load: vendorModule.load
    };
}
