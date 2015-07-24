
include_recipe 'build-essential'
include_recipe 'couchdb'
include_recipe 'curl'
include_recipe 'git'
include_recipe 'nginx'
include_recipe 'nodejs'
include_recipe 'ruby'

gem_package 'sass'

package 'libfreetype6'
package 'libfontconfig'

nodejs_npm "forever"
nodejs_npm "grunt-cli"
nodejs_npm "bower"
