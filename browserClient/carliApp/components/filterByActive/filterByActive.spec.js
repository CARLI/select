describe('The Filter-By-Active filter function', function(){

    var objectList = [
        {
            name: "object1",
            isActive: true
        },
        {
            name: "object2",
            isActive: true
        },
        {
            name: "object3",
            isActive: false
        }
    ];

    beforeEach(module('carli.filterByActive'));

    it('should filter out inactive when state is active', inject(function($filter){
        var activeFilter = $filter('filterByActive');

        expect( activeFilter(objectList, 'Active') ).to.have.length(2);
    }));

    it('should filter out active when state is inactive', inject(function($filter){
        var activeFilter = $filter('filterByActive');

        expect( activeFilter(objectList, 'Inactive') ).to.have.length(1);
    }));

    it('should not filter when state is All', inject(function($filter){
        var activeFilter = $filter('filterByActive');

        expect( activeFilter(objectList, 'All') ).to.have.length(3);
    }));


});
