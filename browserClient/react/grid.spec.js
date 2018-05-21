import { expect } from 'chai';
import * as grid from './grid';

function getTestLibraries() {
    return [
        {
            type: "Library",
            crmId: "3",
            name: "Augustana College",
            institutionYears: "4 Year",
            institutionType: "Private",
            membershipLevel: "Governing"
        },
        {
            type: "Library",
            crmId: "4",
            name: "Aurora University",
            institutionYears: "4 Year",
            institutionType: "Private",
            membershipLevel: "Governing"
        },
        {
            type: "Library",
            crmId: "11",
            name: "Catholic Theological Union",
            institutionYears: "4 Year",
            institutionType: "Private",
            membershipLevel: "Governing"
        }
    ];
}

function getTestProducts() {
    return [
        {
            name: "Essentials Collections: Religion",
            offerings: [
                {
                    "library": "11",
                    "pricing": {
                        "site": 2258,
                        "su": []
                    },
                    "type": "Offering"
                },
                {
                    "library": "4",
                    "pricing": {
                        "site": 2258,
                        "su": []
                    },
                    "type": "Offering"
                },
                {
                    "library": "3",
                    "pricing": {
                        "site": 2258,
                        "su": []
                    },
                    "type": "Offering"
                }
            ],
            id: "003083ed-4b09-47b8-a9f5-d6195b13c001",
            type: "Product"
        },
        {
            name: "Education Abstracts",
            offerings: [
                {
                    "library": "3",
                    "pricing": {
                        "site": 2068,
                        "su": []
                    },
                    "type": "Offering"
                },
                {
                    "library": "11",
                    "pricing": {
                        "site": 2068,
                        "su": []
                    },
                    "type": "Offering"
                }, {
                    "library": "4",
                    "pricing": {
                        "site": 2068,
                        "su": []
                    },
                    "type": "Offering"
                }
            ],
            id: "1279f5ee-4469-49af-b10a-f6b89ccb65c6",
            type: "Product"
        }
    ];
}

describe('The grid module', function () {
    grid.setLibrariesAndProducts(getTestLibraries(), getTestProducts());

    describe('the setLibrariesAndProducts function', function () {
        it('should create the offering hash with keys ', function () {
            const keys = Object.keys(grid.getOfferingHash());
            const expectedKeys = [
                'library-3-product-003083ed-4b09-47b8-a9f5-d6195b13c001',
                'library-3-product-1279f5ee-4469-49af-b10a-f6b89ccb65c6',
                'library-4-product-003083ed-4b09-47b8-a9f5-d6195b13c001',
                'library-4-product-1279f5ee-4469-49af-b10a-f6b89ccb65c6',
                'library-11-product-003083ed-4b09-47b8-a9f5-d6195b13c001',
                'library-11-product-1279f5ee-4469-49af-b10a-f6b89ccb65c6'
            ];

            expect(keys.sort()).to.deep.equal(expectedKeys.sort());
        });

        it('should create the offering hash with the site license price', function () {
            const offeringHash = grid.getOfferingHash();

            expect(offeringHash['library-3-product-003083ed-4b09-47b8-a9f5-d6195b13c001'].originalPrice).to.equal(2258);
            expect(offeringHash['library-11-product-1279f5ee-4469-49af-b10a-f6b89ccb65c6'].originalPrice).to.equal(2068);
        });
    });

    describe('getOffering function', function () {
        it('should return the offering matching the library and product given', function () {
            const library = getTestLibraries().find(l => l.crmId === '4');
            const product = getTestProducts().find(p => p.id === "003083ed-4b09-47b8-a9f5-d6195b13c001");

            const cell = grid.getOffering(library, product);

            expect(cell).to.deep.equal({
                originalPrice: 2258,
                updatedPrice: null
            });
        });
    });

    describe('updateSiteLicensePrice function', function () {
        it('should set the value for the given library and product', function () {
            const library = getTestLibraries().find(l => l.crmId === '4');
            const product = getTestProducts().find(p => p.id === "003083ed-4b09-47b8-a9f5-d6195b13c001");

            grid.updateSiteLicensePrice(library, product, 666);

            expect(grid.getOfferingHash()[grid.getKeyForLibraryAndProduct(library, product)].updatedPrice)
                .to.equal(666);
        });
    });
});