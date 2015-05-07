grunt deploy-app-db;

# Because of a bug with keepalive sockets in node 0.12, the migration will get
# dropped connections from Couch.  Version 0.10 does not have this problem.  If
# your system has 0.12 installed, you can set the path to an alternate
# installation of 0.10.x with the CARLI_MIGRATION_NODE_PATH environment
# variable.

# For example, on a Mac:
# export CARLI_MIGRATION_NODE_PATH=/usr/local/Cellar/node/0.10.33/bin

if [ -n "$CARLI_MIGRATION_NODE_PATH" ]; then
    PATH="$CARLI_MIGRATION_NODE_PATH:$PATH"
fi
node=`which node`

echo -n "Running migrate.js with node "; $node --version

$node ./migrate.js
