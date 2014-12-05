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

});

