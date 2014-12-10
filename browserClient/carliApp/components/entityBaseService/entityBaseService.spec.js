describe('The Entity Base Service', function() {
    beforeEach(module('carli.entityBaseService'));

    it('should provide entityBaseService', inject(function (entityBaseService) {
        expect(entityBaseService).to.be.an('object');
    }));

    describe('The removeEmptyContactsFromEntity(), function', function() {

        it('should be a function', inject(function (entityBaseService) {
            expect(entityBaseService.removeEmptyContactsFromEntity).to.be.a('Function');
        }));

        it('remove empty contacts from an entity', inject(function (entityBaseService) {
            entity = {
                name: 'Test Library',
                type: 'Library',
                contacts: [
                    {
                        "contactType": "Empty"
                    },
                    {
                        "contactType": "Director",
                        "name": "Bob Martin",
                        "email": "bob@cleancode.org",
                        "phoneNumber": "123-555-1234"
                    },
                    {
                        "contactType": "Empty"
                    },
                    {
                        "name": "Not Empty"
                    },
                    {
                        "email": "Not Empty"
                    },
                    {
                        "phoneNumber": "Not Empty"
                    }
                ]
            };
            expect(entity.contacts.length).to.equal(6);
            entityBaseService.removeEmptyContactsFromEntity(entity);
            expect(entity.contacts.length).to.equal(2);
        }));
    });




    describe('The transformObjectsToReferences function', function() {
        it('should be a function', inject(function (entityBaseService) {
            expect(entityBaseService.transformObjectsToReferences).to.be.a('Function');
        }));

        it('should replace an Object property with the Objects ID', inject(function (entityBaseService){
            var testEntity = {
                name: 'testEntity',
                testProperty: {
                    id: 'foo',
                    other_property: "hello"
                },
                another: {
                    id: 'another',
                    foo: "bar"
                }
            };

            entityBaseService.transformObjectsToReferences( testEntity, {'testProperty':{}, 'another': {}} );
            expect(testEntity.testProperty).to.equal('foo');
            expect(testEntity.another).to.equal('another');
        }));
    });

    describe('The  fetchAndTransformObjectsFromReferences function', function() {
        it('should be a function', inject(function (entityBaseService) {
            expect(entityBaseService.fetchAndTransformObjectsFromReferences).to.be.a('Function');
        }));
    });


    describe('The expandReferencesToObjects function', function() {
        it('should be a function', inject(function (entityBaseService) {
            expect(entityBaseService.expandReferencesToObjects).to.be.a('Function');
        }));
    });

    describe('The saveReferences function', function() {
        it('should be a function', inject(function (entityBaseService) {
            expect(entityBaseService.saveReferences).to.be.a('Function');
        }));
    });

    describe('The restoreReferences, function', function() {
        it('should be a function', inject(function (entityBaseService) {
            expect(entityBaseService.restoreReferences).to.be.a('Function');
        }));

        it('should turn references back into saved objects', inject(function (entityBaseService) {
            var savedEntity = {
                name: 'testEntity',
                testProperty: {
                    id: 'foo',
                    other_property: "hello"
                },
                another: {
                    id: 'another',
                    foo: "bar"
                }
            };
            var contractedEntity = {
                name: 'testEntity',
                testProperty: 'foo',
                another:'another'
            };
            entityBaseService.restoreReferences(contractedEntity, savedEntity, {'testProperty':{}, 'another': {}});
            expect(contractedEntity.testProperty.id).to.equal('foo');
            expect(contractedEntity.another.id).to.equal('another');
        }));
    });


});

