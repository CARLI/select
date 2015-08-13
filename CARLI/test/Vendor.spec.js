var chai   = require( 'chai' );
var expect = chai.expect;
var test = require( './Entity/EntityInterface.spec' );
var vendorRepository = require('../Entity/VendorRepository' );

function validVendorData() {
    return {
        type: 'Vendor', 
        name: 'foo' 
    };
}

function invalidVendorData() {
    return {
        type: 'Vendor'
    };
}

test.run('Vendor', validVendorData, invalidVendorData);

describe('getVendorsById', function(){
    it('should be a function', function(){
        expect(vendorRepository.getVendorsById).to.be.a('function');
    });
});

describe('getContactTypesForNotificationCategory', function(){
    it('should be a function', function(){
        expect(vendorRepository.getContactTypesForNotificationCategory).to.be.a('function');
    });

    it('should return "Sales" contact type for notification category "Report"', function(){
        var getCategory = vendorRepository.getContactTypesForNotificationCategory;
        expect(getCategory(vendorRepository.CONTACT_CATEGORY_REPORT)).to.be.an('array');
        expect(getCategory(vendorRepository.CONTACT_CATEGORY_REPORT)[0]).to.equal('Sales');
    });

    it('should return "Unknown Category" contact type for a bogus category', function(){
        var getCategory = vendorRepository.getContactTypesForNotificationCategory;
        expect(getCategory('bogus')[0]).to.equal('Unknown Category');
    });
});

describe('getContactEmailAddressesForNotification', function(){
    var testVendor = validVendorData();
    testVendor.contacts = [
        {
            name: 'Test Billing Contact',
            email: 'test_billing@email.com',
            contactType: 'Billing'
        },
        {
            name: 'Test Sales Contact',
            email: 'test_sales@email.com',
            contactType: 'Sales'
        },
        {
            name: 'Test Technical Contact',
            email: 'test_technical@email.com',
            contactType: 'Technical'
        },
        {
            name: 'Test Director Contact',
            email: 'test_director@email.com',
            contactType: 'Director'
        },
        {
            name: 'Test E-Resources Liaison Contact',
            email: 'test_e_resources_liaison@email.com',
            contactType: 'E-Resources Liaison'
        },
        {
            name: 'Test Other Contact',
            email: 'test_other@email.com',
            contactType: 'Other'
        },
        {
            name: 'Test Notification Only Contact',
            email: 'test_notification_only@email.com',
            contactType: 'Notification Only'
        }
    ];

    it('should be a function', function(){
        expect(vendorRepository.getContactEmailAddressesForNotification).to.be.a('function');
    });

    it('should return the correct contacts for the Report category', function(){
        var getEmail = vendorRepository.getContactEmailAddressesForNotification;
        var testEmails = getEmail(testVendor, vendorRepository.CONTACT_CATEGORY_REPORT);
        expect(testEmails).to.be.an('array');
        expect(testEmails).to.include('test_sales@email.com');
    });
});