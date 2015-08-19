node.default['carli']['nginx']['port'] = 80;
node.default['carli']['nginx']['middleware_url'] = 'http://localhost:3000'
node.default['carli']['nginx']['couch_url'] = 'http://localhost:5984'

node.default['carli']['nginx']['cookie_domain'] = 'qa.pixotech.com'
node.default['carli']['nginx']['staff_app']['hostname'] = 'carli-staff.qa.pixotech.com'
node.default['carli']['nginx']['staff_app']['webroot'] = '/var/www/carli-select/browserClients'
node.default['carli']['nginx']['vendor_app']['hostname'] = 'carli-vendor.qa.pixotech.com'
node.default['carli']['nginx']['vendor_app']['webroot'] = '/var/www/carli-select/browserClients'
node.default['carli']['nginx']['library_app']['hostname'] = 'carli-library.qa.pixotech.com'
node.default['carli']['nginx']['library_app']['webroot'] = '/var/www/carli-select/browserClients'
