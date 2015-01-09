var uuid = require('node-uuid');

var lib1_uuid = uuid.v4();
var lib2_uuid = uuid.v4();
var lib3_uuid = uuid.v4();
var prod1_uuid = uuid.v4();
var prod2_uuid = uuid.v4();
var prod3_uuid = uuid.v4();
var vendor1_uuid = uuid.v4();
var license1_uuid = uuid.v4();

var activeLibrary1 = {
    id: lib1_uuid,
    type: "Library",
    isActive: true,
    fte: 1231,
    name: 'One-Time-Purchase Active Library 1',
    institutionYears: "2 Year",
    institutionType: "Public",
    contacts: []
};

var inactiveLibrary2 = {
    id: lib2_uuid,
    type: "Library",
    isActive: false,
    fte: 31,
    name: 'One-Time-Purchase Inactive Library 2',
    institutionYears: "Other",
    institutionType: "Private",
    contacts: []
};

var activeLibrary3 = {
    id: lib3_uuid,
    type: "Library",
    isActive: true,
    fte: 999,
    name: 'One-Time-Purchase Active Library 3',
    institutionYears: "4 Year",
    institutionType: "Other",
    contacts: []
};

var activeVendor1 = {
    id: vendor1_uuid,
    name: 'One-Time-Purchase Active Vendor 1',
    isActive: true
};

var activeLicense1 = {
    id: license1_uuid,
    name: 'One-Time-Purchase Active License 1',
    isActive: true,
    vendor: vendor1_uuid
};

var activePurchasedProduct1 = {
    id: prod1_uuid,
    name: 'One-Time-Purchase Active Purchased Product 1',
    type: "Product",
    cycleType: "One-Time Purchase",
    isActive: true,
    vendor: vendor1_uuid,
    productURL: "http://product1.vendor.com",
    description: "The Description",
    comments: "These are comments",
    license: license1_uuid,
    oneTimePurchase:  {
            annualAccessFee: 250,
            availableForPurchase: "2014-12-01",
            libraryPurchaseData: {}
        }
};

var inactiveProduct2 = {
    id: prod2_uuid,
    name: 'One-Time-Purchase Inactive Product 2',
    type: "Product",
    cycleType: "One-Time Purchase",
    isActive: false,
    vendor: vendor1_uuid
};

var activeFiscalYearProduct3 = {
    id: prod3_uuid,
    name: 'One-Time-Purchase Active Fiscal Year Product 3',
    type: "Product",
    cycleType: "Fiscal Year",
    isActive: true,
    vendor: vendor1_uuid
};

activePurchasedProduct1.oneTimePurchase.libraryPurchaseData[lib1_uuid] = {
    price: 2500,
    datePurchased: "2014-02-04"
};

activePurchasedProduct1.oneTimePurchase.libraryPurchaseData[lib2_uuid] = {
    price: 3500
};

module.exports = {
    activeLibrary1: activeLibrary1,
    inactiveLibrary2: inactiveLibrary2,
    activeLibrary3: activeLibrary3,
    activeVendor1: activeVendor1,
    activeLicense1: activeLicense1,
    activePurchasedProduct1 : activePurchasedProduct1,
    inactiveProduct2 : inactiveProduct2,
    activeFiscalYearProduct3 : activeFiscalYearProduct3
};
