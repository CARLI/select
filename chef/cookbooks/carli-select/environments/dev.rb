node.default['carli']['nginx']['port'] = 80;
node.default['carli']['nginx']['middleware_url'] = 'http://localhost:3000'
node.default['carli']['nginx']['couch_url'] = 'http://localhost:5984'

node.default['carli']['nginx']['cookie_domain'] = 'dev.pixotech.com'
node.default['carli']['nginx']['staff_app']['hostname'] = 'staff.dev.pixotech.com'
node.default['carli']['nginx']['staff_app']['webroot'] = '/vagrant/browserClient/build'
node.default['carli']['nginx']['vendor_app']['hostname'] = 'vendor.dev.pixotech.com'
node.default['carli']['nginx']['vendor_app']['webroot'] = '/vagrant/browserClient/build'
node.default['carli']['nginx']['library_app']['hostname'] = 'library.dev.pixotech.com'
node.default['carli']['nginx']['library_app']['webroot'] = '/vagrant/browserClient/build'
