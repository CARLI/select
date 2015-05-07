grunt deploy-app-db;

if [ -n "$CARLI_MIGRATION_NODE_PATH" ]; then
    PATH="$CARLI_MIGRATION_NODE_PATH:$PATH"
fi
node=`which node`

echo -n "Running migrate.js with node "; $node --version

$node ./migrate.js
