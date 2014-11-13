var Entity = require('../Entity')
    ;

var ProductRepository = Entity('Product');

ProductRepository.publicFunc = function(){};

module.exports = ProductRepository;
