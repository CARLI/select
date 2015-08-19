node.default['carli']['nginx']['port'] = 80;
node.default['carli']['nginx']['middleware_url'] = 'http://localhost:3000'
node.default['carli']['nginx']['couch_url'] = 'http://localhost:5984'

node.default['carli']['nginx']['cookie_domain'] = 'carli.illinois.edu'
node.default['carli']['nginx']['staff_app']['hostname'] = 'select-staff.carli.illinois.edu'
node.default['carli']['nginx']['staff_app']['webroot'] = '/var/www/carli-select/browserClients'
node.default['carli']['nginx']['vendor_app']['hostname'] = 'select-vendor.carli.illinois.edu'
node.default['carli']['nginx']['vendor_app']['webroot'] = '/var/www/carli-select/browserClients'
node.default['carli']['nginx']['library_app']['hostname'] = 'select-library.carli.illinois.edu'
node.default['carli']['nginx']['library_app']['webroot'] = '/var/www/carli-select/browserClients'
