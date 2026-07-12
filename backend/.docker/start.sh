#!/bin/sh
set -e

# Ensure storage directories exist
mkdir -p /app/storage/framework/cache/data
mkdir -p /app/storage/framework/sessions
mkdir -p /app/storage/framework/views
mkdir -p /app/storage/logs

# Set permissions
chmod -R 775 /app/storage
chmod -R 775 /app/bootstrap/cache

# Create .env from environment variables if it doesn't exist
if [ ! -f /app/.env ]; then
    echo "APP_KEY=${APP_KEY:-}" > /app/.env
    echo "APP_ENV=${APP_ENV:-production}" >> /app/.env
    echo "APP_DEBUG=${APP_DEBUG:-false}" >> /app/.env
    echo "APP_URL=${APP_URL:-}" >> /app/.env
    echo "DB_CONNECTION=pgsql" >> /app/.env
    echo "DB_HOST=${DB_HOST:-}" >> /app/.env
    echo "DB_PORT=${DB_PORT:-5432}" >> /app/.env
    echo "DB_DATABASE=${DB_DATABASE:-postgres}" >> /app/.env
    echo "DB_USERNAME=${DB_USERNAME:-}" >> /app/.env
    echo "DB_PASSWORD=${DB_PASSWORD:-}" >> /app/.env
fi

# Run migrations
php /app/artisan migrate --force

# Cache config for performance
php /app/artisan config:cache
php /app/artisan route:cache
php /app/artisan view:cache

# Start php-fpm and nginx
php-fpm -D
nginx -g "daemon off;"
