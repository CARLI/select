
describe('The Edit Product Controller', function(){

    var newCtrl, editCtrl, mockDependenciesForNewProduct, mockDependenciesForEditProduct;

    beforeEach(function(){
        module('carli.sections.products.edit');
        module('carli.mockServices');

        inject(function ($controller, $rootScope, $q, mockLocationService, mockLibraryService, mockProductService, mockVendorService, mockAlertService) {
            mockDependenciesForNewProduct = {
                $location: mockLocationService,
                $routeParams: {
                    id: 'new'
                },
                productService: mockProductService,
                libraryService: mockLibraryService,
                vendorService: mockVendorService,
                alertService: mockAlertService
            };

            mockDependenciesForEditProduct = {
                $location: mockLocationService,
                $routeParams: {
                    id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
                },
                productService: mockProductService,
                libraryService: mockLibraryService,
                vendorService: mockVendorService,
                alertService: mockAlertService
            };

            newCtrl  = $controller('editProductController', mockDependenciesForNewProduct);
            editCtrl = $controller('editProductController', mockDependenciesForEditProduct);
            $rootScope.$digest();
        });
    });

    it('should have a default, editable Product on the New Product screen', function(){
        expect( newCtrl.product.isActive ).to.equal(true);
        expect( newCtrl.editable ).to.equal(true);
        expect( newCtrl.newProduct ).to.equal(true);
    });

    it('should call productService.create when saving a new Product', function(){
        expect( mockDependenciesForNewProduct.productService.createOrUpdate ).to.equal('neither');
        newCtrl.saveProduct();
        expect( mockDependenciesForNewProduct.productService.createOrUpdate ).to.equal('create');
    });

    it('should add an alert when saving a new Product', inject(function($rootScope){
        expect( mockDependenciesForNewProduct.alertService.alertCount ).to.equal( 0 );
        newCtrl.saveProduct();
        $rootScope.$digest();
        expect( mockDependenciesForNewProduct.alertService.alertCount ).to.equal( 1 );
    }));

    it('should have a known, non-editable Product on the Edit Product screen', function(){
        expect( editCtrl.product.name ).to.equal('Test Product 0');
        expect( editCtrl.editable ).to.equal(false);
        expect( editCtrl.newProduct ).to.equal(false);
    });

    it('should call productService.update when saving an existing Product', function(){
        expect( mockDependenciesForEditProduct.productService.createOrUpdate ).to.equal('neither');
        editCtrl.saveProduct();
        expect( mockDependenciesForEditProduct.productService.createOrUpdate ).to.equal('update');
    });

    it('should add an alert when saving an existing Product', inject(function($rootScope){
        expect( mockDependenciesForEditProduct.alertService.alertCount ).to.equal( 0 );
        editCtrl.saveProduct();
        $rootScope.$digest();
        expect( mockDependenciesForEditProduct.alertService.alertCount ).to.equal( 1 );
    }));

    it('should toggle the editable variable when calling toggleEditable()', function(){
        expect( editCtrl.editable ).to.equal(false);
        editCtrl.toggleEditable();
        expect( editCtrl.editable ).to.equal(true);
    });

});

