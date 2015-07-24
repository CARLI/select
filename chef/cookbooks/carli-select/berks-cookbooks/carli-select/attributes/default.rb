
node.default['carli']['nginx']['port'] = 8080;
node.default['carli']['nginx']['middleware_url'] = 'http://localhost:3000'
node.default['carli']['nginx']['couch_url'] = 'http://localhost:5984'

node.default['carli']['nginx']['cookie_domain'] = 'carli.local'
node.default['carli']['nginx']['staff_app']['hostname'] = 'staff.carli.local'
node.default['carli']['nginx']['staff_app']['webroot'] = '/vagrant/browserClient/build'
node.default['carli']['nginx']['staff_app']['entrypoint'] = '/carliApp/index.html'
node.default['carli']['nginx']['vendor_app']['hostname'] = 'vendor.carli.local'
node.default['carli']['nginx']['vendor_app']['webroot'] = '/vagrant/browserClient/build'
node.default['carli']['nginx']['vendor_app']['entrypoint'] = '/vendorApp/index.html'
node.default['carli']['nginx']['library_app']['hostname'] = 'library.carli.local'
node.default['carli']['nginx']['library_app']['webroot'] = '/vagrant/browserClient/build'
node.default['carli']['nginx']['library_app']['entrypoint'] = '/libraryApp/index.html'


node.override['couch_db']['config']['couchdb']['max_dbs_open'] = 500

node.override['couch_db']['config']['httpd']['bind_address'] = '0.0.0.0'
node.override['couch_db']['config']['httpd']['enable_cors'] = 'true'

node.override['couch_db']['config']['httpd']['authentication_handlers'] = '{couch_httpd_auth, default_authentication_handler}, {couch_httpd_auth, cookie_authentication_handler}'
node.override['couch_db']['config']['httpd']['default_handler'] = '{couch_httpd_db, handle_request}'

node.override['couch_db']['config']['cors']['origins'] = '*'

node.override['couch_db']['config']['couch_httpd_auth']['allow_persistent_cookies'] = 'true'
node.override['couch_db']['config']['couch_httpd_auth']['timeout'] = '28800'


node.override['nginx']['conf_template'] = 'nginx.conf.erb'
node.override['nginx']['conf_cookbook'] = 'carli-select'
