
describe('The Edit Product Controller', function(){

    var mockLocation, mockProductService, mockDependeciesForNewProduct, mockDependenciesForEditProduct;

    beforeEach(module('carli.sections.products.edit'));

    beforeEach(inject( function($q) {
        mockLocation = {
            path: function(){}
        };

        mockProductService = {
            createOrUpdate: 'neither',
            create: function(){
                var deferred = $q.defer();
                this.createOrUpdate = 'create';
                deferred.resolve();
                return deferred.promise;
            },
            update: function(){
                var deferred = $q.defer();
                this.createOrUpdate = 'update';
                deferred.resolve();
                return deferred.promise;
            },
            load: function(){
                var deferred = $q.defer();
                deferred.resolve( 
                    {
                        name: 'Test Product'
                    }
                );
                return deferred.promise;
            },
            reset: function(){
                this.createOrUpdate = 'neither';
            }
        };

        mockDependenciesForNewProduct = {
            $location: mockLocation,
            $routeParams: {
                id: 'new'
            },
            productService: mockProductService
        };

        mockDependenciesForEditProduct = {
            $location: mockLocation,
            $routeParams: {
                id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
            },
            productService: mockProductService
        };
    } ));

    afterEach(function(){
        mockProductService.reset();
    });

    it('should have a default, editable Product on the New Product screen', inject(function($controller){
        var editCtrl = $controller('editProductController', mockDependenciesForNewProduct);
        expect( editCtrl.product.isActive ).to.equal(true);
        expect( editCtrl.editable ).to.equal(true);
        expect( editCtrl.newProduct ).to.equal(true);
    }));

    it('should call productService.create when saving a new Product', inject(function($controller, $rootScope){
        var editCtrl = $controller('editProductController', mockDependenciesForNewProduct);
        expect( mockDependenciesForNewProduct.productService.createOrUpdate ).to.equal('neither');
        editCtrl.saveProduct();
        $rootScope.$digest();
        expect( mockDependenciesForNewProduct.productService.createOrUpdate ).to.equal('create');
    }));

    it('should have a known, non-editable Product on the Edit Product screen', inject(function($controller, $rootScope){
        var editCtrl = $controller('editProductController', mockDependenciesForEditProduct);
        $rootScope.$digest();
        expect( editCtrl.product.name ).to.equal('Test Product');
        expect( editCtrl.editable ).to.equal(false);
        expect( editCtrl.newProduct ).to.equal(false);
    }));

    it('should call productService.update when saving an existing Product', inject(function($controller, $rootScope){
        var editCtrl = $controller('editProductController', mockDependenciesForEditProduct);
        expect( mockDependenciesForEditProduct.productService.createOrUpdate ).to.equal('neither');
        editCtrl.saveProduct();
        $rootScope.$digest();
        expect( mockDependenciesForEditProduct.productService.createOrUpdate ).to.equal('update');
    }));

    it('should toggle the editable variable when calling toggleEditable()', inject(function($controller){
        var editCtrl = $controller('editProductController', mockDependenciesForEditProduct);
        expect( editCtrl.editable ).to.equal(false);
        editCtrl.toggleEditable();
        expect( editCtrl.editable ).to.equal(true);
    }));

});

