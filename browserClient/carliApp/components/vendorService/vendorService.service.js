angular.module('carli.vendorService')
    .service('vendorService', vendorService);

function vendorService( CarliModules ) {

    var vendorModule = CarliModules.Vendor;

    vendorModule.setStore( CarliModules.FixtureStore );

    return {
        list: vendorModule.list,
        create: vendorModule.create,
        update: vendorModule.update,
        load: vendorModule.load
    };
}
