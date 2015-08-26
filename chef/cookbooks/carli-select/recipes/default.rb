
include_recipe 'build-essential'
include_recipe 'couchdb'
include_recipe 'curl'
include_recipe 'git'
include_recipe 'nginx'
# Needs to be > 0.12.x, not sure if this installs the right version.
include_recipe 'nodejs'
include_recipe 'ruby'

gem_package 'sass'

package 'libfreetype6'
package 'libfontconfig'

nodejs_npm "forever"
nodejs_npm "grunt-cli"
nodejs_npm "bower"

# Chef should also:

# * Make sure jenkins user exists and has authorized key installed
# * Install /etc/init script for carli-select (start/stop the middleware)
#   * Make sure it is started on boot
# * Install logrotated configuration for carli-select.log
# * Set up cron job to call the `sync-all-databases` on the appropriate schedule
