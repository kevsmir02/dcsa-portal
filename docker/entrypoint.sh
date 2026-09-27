#!/bin/sh
# Runs before the web server each time the demo container starts.
set -e

# The app key must survive restarts, or every session cookie becomes
# unreadable, so it lives in the dcsa-app-data volume rather than the image.
KEY_FILE=/data/app.key
if [ -z "$APP_KEY" ]; then
    if [ ! -s "$KEY_FILE" ]; then
        php -r 'echo "base64:".base64_encode(random_bytes(32));' > "$KEY_FILE"
    fi
    APP_KEY=$(cat "$KEY_FILE")
    export APP_KEY
fi

# migrate:status fails only when there is no migrations table yet: a brand-new
# database gets the schema and the demo school, an existing one keeps its data
# and just picks up any migrations added since.
if php artisan migrate:status >/dev/null 2>&1; then
    php artisan migrate --force
else
    php artisan migrate --seed --force
fi

exec "$@"
