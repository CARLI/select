angular.module('vendor.sections.siteLicensePrices')
    .controller('siteLicensePricesController', siteLicensePricesController);

function siteLicensePricesController($q, libraryService, productService){
    var vm = this;
    vm.loadingPromises = [];
    vm.viewOptions = {};

    vm.getPrice = getPrice;

    activate();

    function activate() {
        vm.viewOptions = {
            size: true,
            type: true,
            years: true,
            priceCap: true
        };

        vm.loadingPromise = $q.all(
            loadLibraries(),
            loadProducts()
        );
    }

    function loadLibraries() {
        return libraryService.list().then(function (libraries) {
            vm.libraries = libraries;
        });
    }
    function loadProducts() {
        var ovid = {
            id: 'a8d26b37-bc22-45b0-b1f5-b7e57143a03c',
            name: 'OVID'

        };
        var ebsco = {
            id: 'e17bfd74-3aa1-4e1a-91e2-d37f37d03350',
            name: 'EBSCO'
        };
        var proQuest = {
            id: '29cee600-f6a7-4cde-b178-ecb8d8bae525',
            name: 'ProQuest'
        };


        vm.products = [
            {
                id: 'fc1ea9d9-8a5f-4ede-a30d-655380a3860b',
                name: 'Book Review Digest',
                vendor: ebsco,
                priceCap: 5
            },
            {
                id: 'db81a29e-82fc-4dad-ac9e-0fe9e2fec723',
                name: 'EBSCO Medline with Full Text',
                vendor: ebsco,
                priceCap: 7
            },
            {
                id: 'f8ffe6d9-4f6c-49ce-8b2c-0c9e7670b5c0',
                name: 'Education Administration Abstracts',
                vendor: ebsco,
                priceCap: 5
            },
            {
                id: 'b5906e37-4d62-4ea2-9c4f-69ffd50553d6',
                name: 'Historical Chicago Tribune',
                vendor: proQuest,
                priceCap: 5
            },
            {
                id: 'f52af3c9-0d3e-411e-aaff-e63befe70c61',
                name: 'Worldwide Political Science Abstracts',
                vendor: proQuest,
                priceCap: 5
            },
            {
                id: 'f6501391-fb6e-4154-936a-86a4263f2a42',
                name: 'ProQuest Government Periodicals Index',
                vendor: proQuest,
                priceCap: 5
            },
            {
                id: '37111100-ee65-42c8-88c0-83467c39c5e0',
                name: 'Agricola',
                vendor: ovid,
                priceCap: 7
            },
            {
                id: '6b8ef17d-7a67-498e-86bd-e0324984e694',
                name: 'Global Health',
                vendor: ovid,
                priceCap: 7
            },
            {
                id: 'd6ed1052-ac7a-4fe6-810e-b0a2366c4b94',
                name: 'GEOBASE',
                vendor: ovid,
                priceCap: 7
            }
        ];


        return $q.when([]);
//        return productService.list().then(function (products) {
//            vm.products = products;
//        });
    }

    function getPrice(){
        return '';
    }
}
